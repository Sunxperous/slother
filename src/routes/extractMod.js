var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../schema/userSchema');
var Calendar = require('../schema/calendarSchema');
var moment = require('moment');
var async = require('async');
//  extract module info from nusmods address.
//  Input         : address of nusmods 
//  Output        : Array Events info by callback
//  Output format : <VarName>[]
//  Array includes: dateStart,dateEnd,description,
//                  summary,exclude,location,rrule
//
//  Manual enter of semStart date 
/*
  http://nusmods.com/timetable/
  [{"ModuleCode":"CS2010",
  "selectedLessons":[{"ClassNo":"1","LessonType":"Lecture"},
                    {"ClassNo":"4","LessonType":"Tutorial"},
                    {"ClassNo":"5","LessonType":"Laboratory"}]},
  {"ModuleCode":"CS2101",
  "selectedLessons":[{"ClassNo":"1","LessonType":"Sectional Teaching"}]},


*/
function extract(addr, userId, callback) {
  
  var addr = decodeURIComponent(addr.trim().replace("http://","").
                replace("nusmods.com/timetable/",""));
      year = addr.substring(0,9),
      sem = addr.substring(13,14);
      semStart = moment(semesterStart(year,sem)),
      tempURL = "http://api.nusmods.com/"+year+"/"
                +sem+'/modules/CS1010.json',
      tempModCode = "CS1010",
      eventInfo = [],
      tempSem = semStart.toDate(); 
      modInfos = convert(addr.substring(15).split("&"));
  Calendar.create({
    name: "NUS "+year+"/"+sem,
    user: userId,
    events: []
  }, function (err,calendar) {
    if(err) { console.log(err); res.send(null); }
    async.each(modInfos, function (modInfo, callback){
      tempURL = tempURL.replace(tempModCode,modInfo.ModuleCode); 
      tempModCode = modInfo.ModuleCode;
      request({ url: tempURL, json: true}, function (error, res, body) {
        if(err) { console.log(err); res.send(null); }
        var modJSON = res.body,
            exam = false;
        for(var y in modJSON.Timetable) {
          semStart = moment(tempSem);
          var lessonType = checkLessonTaken(modJSON.Timetable[y], 
                            modInfo, modJSON.ModuleCode);
          if(!lessonType)
            continue;
          else{
            calendar.events.push(buildNUSEvent(modJSON,semStart,y));
          }
          if(modJSON.ExamDate !== undefined && exam == false) {
            calendar.events.push(buildNUSExam(modJSON,semStart));
            exam = true;
          }
        }
        callback();
      });
    }, function(err) {
      calendar.save(function (err,calendar) {
        if(err) { console.log(err); res.send(null); }
        else callback(null, calendar); 
      });
    });
  });
}


//Return class type string
//Input: class no. from nusMods 
//        eg. "8T04" of "MA2213=8T04"
function convert(lesson) {
  var temp = [];
  var module = [];
  var oldCode = "";
  for(var x in lesson) {
    var head = lesson[x].indexOf("[");
    var tail = lesson[x].indexOf("]");
    var code = lesson[x].substring(0,head);
    var classNo = lesson[x].substring(tail+2);
    var type = lesson[x].substring(head+1,tail);
    switch(type) {
      case "SEC": type = "Sectional Teaching"; break;
      case "LEC": type = "Lecture"; break;
      case "TUT": type = "Tutorial"; break;
      case "TUT2": type = "Tutorial Type 2"; break;
      case "TUT3": type = "Tutorial Type 3"; break;
      case "LAB": type = "Laboratory"; break;
      case "DLEC": type = "Design Lecture"; break;
      case "REC": type = "Recitation"; break;
    }
    if(oldCode !== code) { 
      if(oldCode !== "")
        temp.push(module);
      module = {
        selectedLessons:[],
        ModuleCode: code
      };
    }
    module.selectedLessons.push({ClassNo: classNo, 
                                  LessonType: type});
    oldCode = code;
  }
  temp.push(module);
  return temp;
}


//Return boolean whether lesson is in user timetable
//Input:  timetable from nusmods
//        lesson class from nusmods url
function checkLessonTaken(timetable, lessons, code) {
  for(var x in lessons.selectedLessons) {
    if(lessons.selectedLessons[x].ClassNo == timetable.ClassNo && 
        lessons.selectedLessons[x].LessonType == timetable.LessonType)
      return true;    
  }
    return false;
}

//Build an event class for NUS module
//Output: An ics event class of NUS module lesson
//Input : Data from NUSAPI, semester of the class, 
//        classNo of NUSAPI timetable array   
//NOTE: corrected to UTC
function buildNUSEvent(data, semStart, classNo) {
  var temp = {
        summary: data.ModuleCode,
        description: data.ModuleTitle + " - ClassNo: " 
                    + data.Timetable[classNo].ClassNo,
        location: data.Timetable[classNo].Venue,
        rrule: {
          freq: "dummy",
          count: 14 //default semester week
        },
        exclude: []
  };
  switch(data.Timetable[classNo].LessonType) {
    case "Laboratory": temp.summary = temp.summary +  " (LAB)"; break;
    case "Sectional Teaching": temp.summary = temp.summary +  " (SEC)"; break;
    case "Lecture": temp.summary = temp.summary + " (LECT)"; break;
    case "Tutorial": 
    case "Tutorial Type 2":
    case "Tutorial Type 3": temp.summary = temp.summary + " (TUT)"; break;
    case "Recitation":  temp.summary = temp.summary + " (RECI)"; break;
  }
  switch(data.Timetable[classNo].DayText) {
    case "Sunday" :  semStart.add('day',6); break;
    case "Saturday" :  semStart.add('day',5); break;
    case "Friday" : semStart.add('day',4); break;
    case "Thursday" : semStart.add('day',3); break;
    case "Wednesday" : semStart.add('day',2); break;
    case "Tuesday" : semStart.add('day',1); break;
    case "Monday" : semStart; break;
  }
  var tempTime = semStart.clone().hour(parseInt(
              data.Timetable[classNo].StartTime.substring(0,2)));
  //Correct to UTC timezone
  tempTime.subtract('hour',8);
  switch(data.Timetable[classNo].WeekText) {
    case "Odd Week": {
      temp.exclude.push(tempTime.clone().add('week',1).toDate()); //week 2
      temp.exclude.push(tempTime.clone().add('week',3).toDate()); //week 4
      temp.exclude.push(tempTime.clone().add('week',5).toDate()); //week 6
      temp.exclude.push(tempTime.clone().add('week',6).toDate()); //recess week 7
      temp.exclude.push(tempTime.clone().add('week',8).toDate()); //week 9
      temp.exclude.push(tempTime.clone().add('week',10).toDate()); //week 11 
      temp.exclude.push(tempTime.clone().add('week',12).toDate()); //week 13
    } break;
    case "Even Week": {
      temp.exclude.push(tempTime.clone().toDate()); //week 1
      temp.exclude.push(tempTime.clone().add('week',2).toDate()); //week 3
      temp.exclude.push(tempTime.clone().add('week',4).toDate()); //week 5
      temp.exclude.push(tempTime.clone().add('week',6).toDate()); //recess week 7
      temp.exclude.push(tempTime.clone().add('week',7).toDate()); //week 8
      temp.exclude.push(tempTime.clone().add('week',9).toDate()); //week 10
      temp.exclude.push(tempTime.clone().add('week',11).toDate()); //week 12
      temp.exclude.push(tempTime.clone().add('week',13).toDate()); //week 14
    } break;
    case "Every Week":
      temp.exclude.push(tempTime.clone().add('week',6).toDate());
      break;
  }
  temp.rrule.freq = "WEEKLY";
  if(data.Timetable[classNo].LessonType == "Tutorial" || 
    data.Timetable[classNo].LessonType == "Tutorial Type 2" ||
    data.Timetable[classNo].LessonType == "Tutorial Type 3" ||
    data.Timetable[classNo].LessonType == "Laboratory") {
      if(data.Timetable[classNo].WeekText !== "Even Week")
        temp.exclude.push(tempTime.clone().toDate());
      if(data.Timetable[classNo].WeekText !== "Odd Week")
        temp.exclude.push(tempTime.clone().add('week',1).toDate());
    }
  temp.dateStart = tempTime.clone().toDate();
  tempTime.hour(parseInt(data.Timetable[classNo].EndTime.substring(0,2))-8);
  temp.dateEnd = tempTime.clone().toDate();

  return temp;
}


//Build an event class for NUS module
//Output: An ics event class of NUS module FINAL EXAM
//Input : Data from NUSAPI, semester of the class,
//DEFAULT exam time is 3 hours
//NOTE: corrected to UTC
function buildNUSExam(data, semStart) {
  var examD = data.ExamDate;
  var tempT = parseInt(examD.substring(11,13))-8; //To UTC
  examD = examD.substring(0,4)+examD.substring(5,7)+
    examD.substring(8,10);
  var temp = {
        summary: data.ModuleCode + " (EXAM)",
        description: data.ModuleTitle, 
        rrule: {
          freq: "ONCE"
        },
        dateStart: moment(examD,"YYYYMMDD").add('hour',tempT)
  };
  temp.dateEnd = temp.dateStart.clone().add('hour',3).toDate();
  temp.dateStart = temp.dateStart.clone().toDate();
  return temp;
}

//Return the semester start date 
//Output: Semester start date in js date format
//Input: year (eg. "2013-2014") and 
//       semester (eg. "1") string 
//NOTE: corrected to UTC timezone
//Manual key calendar and Monday as start day
function semesterStart(year,sem) {
  var test;
  switch(year) {
    case "2014-2015": {
      //11-8-2014 & 12-1-2015
      (sem=="1")?test = moment("11082014","DDMMYYYY"): 
                 test = moment("12012015","DDMMYYYY");
    } break; 
    case "2013-2014": {
      //13-01-2014 & 12-08-2013
      (sem=="1")?test = moment("12082013","DDMMYYYY"): 
                 test = moment("13012014","DDMMYYYY");
    } break; 
  }
  return test.toDate();
}

function loggedIn(req, res, next) {
  if (req.user) { next(); }
  else { 
    res.redirect('/login'); 
    res.send({error: "Please log in"});
  }
}

router.get('/', loggedIn, function (req,res) {
  var addr = req.query.addr;
  extract(decodeURIComponent(addr), req.user._id, function (err, calendar) {
    if(err) { console.log(err); res.send(null); }
    else {
      User.findOneAndUpdate({username: req.user.username},
        {$push:{calendars:calendar._id}}, function (err, user) {
          if(err) { console.log(err); res.send(null); }
          else {
<<<<<<< HEAD
            calendar.user = user._id;
            calendar.save(function (err,calendar) {
              if(err) { console.log(err); res.send(null); }
              else {
                console.log("calendar "+calendar.events.length);
                res.send(calendar);
              }
            });
=======
            console.log("calendar id is"+calendar.user);
            console.log("calendar "+calendar.events.length);
            res.send(calendar.events);
>>>>>>> Change replace calendar to add calendar. Allow multiple
          }
      });
    }
  });
});

module.exports = router;