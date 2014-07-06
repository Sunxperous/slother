var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../schema/userSchema');
var Calendar = require('../schema/calendarSchema');
var moment = require('moment');
//  extract module info from nusmods address.
//  Input         : address of nusmods 
//  Output        : Array Events info by callback
//  Output format : <VarName>[]
//  Array includes: dateStart,dateEnd,description,
//                  summary,exclude,location,rrule
//  Example link  : http://nusmods.com/2013-2014/sem2/
//                  v1/#IS1103=63&ST2334=2SL1&ST2334=
//                  8T9&ST2334=2SL1
//
//  Manual enter of semStart date 
function extract(addr, userId, callback) {
  
  var year = addr.substring(19,28),
      sem = addr.substring(32,33),
      modDetailInfo = {};
  addr = addr.substring(38);
  mod = addr.split("&");
  mod.sort();
  var tempMod = mod.pop().split("=");
  while(tempMod !== undefined) {
    var tempOb = {
      codeNo: tempMod[0],
      lect: [], lab: [], sect: [], tut: [], reci: [],
      tut2: [], tut3: []
    };
    
    while(tempMod[0] == tempOb.codeNo) {
        tempOb[noToLessonType(tempMod[1])].
          push(tempMod[1].substring(1));  
        tempMod = mod.pop();
        if(tempMod == undefined) { break; }
        else 
          tempMod = tempMod.split("="); 
    }
    modDetailInfo[tempOb.codeNo] = tempOb;
  }
  var semStart = moment(semesterStart(year,sem));
  //Manual key calender and Monday as start day
  var tempURL = "http://api.nusmods.com/"+year+"/"
                +sem+'/modules/FE5218.json',
      tempModCode = "FE5218",
      eventInfo = [],
      isDone = {};
      tempSem = semStart.toDate();
  Calendar.findOneAndRemove({semester:year+"/"+sem,user:userId},
    function (err,oldCalendar) {
    if(err) { console.log(err); res.send(null); }
    else {
      Calendar.create({
        type: "NUS",
        semester: year+"/"+sem,
        user: userId,
        events: []
      }, function (err,calendar) {
        if(err) { console.log(err); res.send(null); }
        for(var x in modDetailInfo) {
          isDone[x] = false;
          tempURL = tempURL.replace(tempModCode,x); 
          tempModCode = x;
          request({ url: tempURL, json: true}, 
            function (error, res, body) {
              var modJSON = res.body,
                  exam = false;
              for(var y in modJSON.Timetable) {
                semStart = moment(tempSem);
                //Go through and copy each element.
                //First, handle normal lesson timetable.
                var timetable = modJSON.Timetable[y],
                    lessonType = checkLessonTaken(timetable,
                              modDetailInfo[modJSON.ModuleCode]);
                if(lessonType == false)
                  continue;
                else
                  calendar.events.push(buildNUSEvent(modJSON,semStart,y));
                //Next, exam info
                if(modJSON.ExamDate !== undefined && exam == false) {
                  calendar.events.push(buildNUSExam(modJSON,semStart));
                  exam = true;
                }
              }
              isDone[modJSON.ModuleCode] = true;
              var allDone = true;
              for(var z in isDone) {
                if(!isDone[z]) {
                  allDone = false;
                }
              }
              if(allDone) {

                calendar.save(function (err,calendar) {
                  var oldExist = false;
                  if(oldCalendar !== null) {
                    oldExist = true;
                    User.findOneAndUpdate({_id:userId},
                      {$pull:{calendars:{$in:[oldCalendar._id]}}},
                      function (err,user) {
                        if(err) { console.log(err); res.send(null); }
                        callback(null, calendar);
                      })
                  } 
                    if(!oldExist)
                    callback(null, calendar);
                });
              }
          });
        }
      });
    }
  });
}

//Return class type string
//Input: class no. from nusMods 
//        eg. "8T04" of "MA2213=8T04"
function noToLessonType(lesson) {
  switch(lesson.substring(0,1)) {
  case '1': return "lab"; //Laboratory
  case '2': return "lect"; //Lecture
  case '5': return "reci"; //Recitation Group
  case '6': return "sect"; //Sectional Teaching
  case '8': return "tut"; //Tutorial
  case '9': return "tut2"; //Tutorial 2
  case 'A': return "tut3"; //Tutorial 3
  default: console.log("Unknown type: '"+lesson.substring(0,1)+"'");
  }
}


//Return boolean whether lesson is in user timetable
//Input:  timetable class from nusmods
//        lessonNo class grouped by lect,lab,tut,sect
function checkLessonTaken(timetable, lessonNo) {
  switch(timetable.LessonType) {
      case "Lecture": 
        for(var x in lessonNo.lect) 
          {return (timetable.ClassNo == 
                      lessonNo.lect[x])?true:false;}
      case "Laboratory": 
        for(var x in lessonNo.lab)
          {return (timetable.ClassNo == 
                      lessonNo.lab[x])?true:false;}
      case "Tutorial": 
        for(var x in lessonNo.tut)
          {return (timetable.ClassNo == 
                      lessonNo.tut[x])?true:false;}
      case "Tutorial Type 2":
        for(var x in lessonNo.tut2)
          {return (timetable.ClassNo == 
                      lessonNo.tut2[x])?true:false;}
      case "Tutorial Type 3":
        for(var x in lessonNo.tut3)
          {return (timetable.ClassNo == 
                      lessonNo.tut3[x])?true:false;}
      case "Sectional Teaching": 
        for(var x in lessonNo.sect)
          {return (timetable.ClassNo == 
                      lessonNo.sect[x])?true:false;}
      case "Recitation":
        for(var x in lessonNo.reci)
          {return (timetable.ClassNo == 
                      lessonNo.reci[x])?true:false;}

      default: 
        console.log("Non-defined lesson-type")
        return false;
        //For error checking
  }
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
  var tempTime = semStart.clone().hour(parseInt(data.Timetable[classNo].StartTime.substring(0,2)));
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
      temp.exclude.push(tempTime.clone().add('week',6).toDate()); //recess week 7
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
  tempTime.hour(parseInt(data.Timetable[classNo].EndTime.substring(0,2))-8); //To UTC
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
//Manual key calender and Monday as start day
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
  extract(decodeURIComponent(addr),req.user._id, function (err, calendar) {
    if(err) {console.log("err :'"+err+"'.");}
    else {
      User.findOneAndUpdate({username: req.user.username},
        {$push:{calendars:calendar._id}}, function (err, user) {
          if(err) { console.log(err); res.send(null); }
          else {
            calendar.user = user._id;
            calendar.save(function (err,calendar) {
              if(err) { console.log(err); res.send(null); }
              res.send({success:"Module updated."});
            });
          }
      });
    }
  });
});

module.exports = router;