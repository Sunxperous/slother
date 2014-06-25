var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
          username: String,
          events: Array,
          group: Array
});

var User = mongoose.model('user',userSchema);

//  extract module info from nusmods address.
//  Input         : address of nusmods 
//  Output        : Array Events info
//  Output format : <VarName>[]
//  Array includes: dateStart,dateEnd,description,
//                  summary,exclude,location,rrule
//  Example link  : http://nusmods.com/2013-2014/sem2/
//                  v1/#IS1103=63&ST2334=2SL1&ST2334=
//                  8T9&ST2334=2SL1
//
//  Manual enter of semStart date 

function extract(addr, callback) {
  
  var year = addr.substring(19,28),
      sem = addr.substring(32,33),
      modDetailInfo = {};
  addr = addr.substring(38);
  mod = addr.split("&");
  mod.sort();
  //console.log(mod);
  var tempMod = mod.pop().split("=");
  while(tempMod !== undefined) {
    var tempOb = {
      codeNo: tempMod[0],
      lect: [], lab: [], sect: [], tut: [], reci: [],
      tut2: [], tut3: []
    };
    
  //console.log(tempOb);
    while(tempMod[0] == tempOb.codeNo) {
        // console.log("tempMod 0 is "+tempMod[0]);
        // console.log("tempMod 1 is "+tempMod[1]);
        // console.log("type is "+noToLessonType(tempMod[1]))
        tempOb[noToLessonType(tempMod[1])].
          push(tempMod[1].substring(1));  
        tempMod = mod.pop();
        if(tempMod == undefined) { break; }
        else 
          tempMod = tempMod.split("="); 
    }
    modDetailInfo[tempOb.codeNo] = tempOb;
  }
  //console.log(modDetailInfo);
  var semStart = semesterStart(year,sem);
  //Manual key calender and Monday as start day

  var tempURL = "http://api.nusmods.com/"+year+"/"
                +sem+'/modules/FE5218.json',
      tempModCode = "FE5218",
      eventInfo = [],
      isDone = {};
  for(var x in modDetailInfo) {
    isDone[x] = false;
    tempURL = tempURL.replace(tempModCode,x); 
    tempModCode = x;
    request({ url: tempURL, json: true}, 
      function (error, res, body) {
        var modJSON = res.body;
        for(var y in modJSON.Timetable) {
          //Go through and copy each element.
          //First, handle normal lesson timetable.
          var timetable = modJSON.Timetable[y],
              lessonType = checkLessonTaken(timetable,
                        modDetailInfo[modJSON.ModuleCode]);
          if(lessonType == false)
            continue;
          else
            eventInfo.push(buildNUSEvent(modJSON,
              new Date(semStart.getTime()),y));
        }
        //Next, exam info
        if(modJSON.ExamDate !== undefined) {
          eventInfo.push(buildNUSExam(modJSON,
            new Date(semStart.getTime())));
        }
        isDone[modJSON.ModuleCode] = true;
        var allDone = true;
        for(var z in isDone) {
          if(!isDone[z]) {
            allDone = false;
          }
        }
        if(allDone) {
          callback(null, eventInfo);
        }
    });
  }
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
      case "LECTURE": 
        for(var x in lessonNo.lect)
          return (timetable.ClassNo == 
            lessonNo.lect[x])?true:false;
      case "LABORATORY": 
        for(var x in lessonNo.lab)
          return (timetable.ClassNo == 
            lessonNo.lab[x])?true:false;
      case "TUTORIAL": 
        for(var x in lessonNo.tut)
          return (timetable.ClassNo == 
            lessonNo.tut[x])?true:false;
      case "TUTORIAL TYPE 2":
        for(var x in lessonNo.tut2)
          return (timetable.ClassNo == 
            lessonNo.tut2[x])?true:false;
      case "TUTORIAL TYPE 3":
        for(var x in lessonNo.tut3)
          return (timetable.ClassNo == 
            lessonNo.tut3[x])?true:false;
      case "SECTIONAL TEACHING": 
        for(var x in lessonNo.sect)
          return (timetable.ClassNo == 
            lessonNo.sect[x])?true:false;
      case "RECITATION":
        for(var x in lessonNo.reci)
          return (timetable.ClassNo == 
            lessonNo.reci[x])?true:false;

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
  //console.log("semStart = " + semStart + ", data = "+data.ModuleCode);
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
         // dateStart, dateEnd, 
  };
  switch(data.Timetable[classNo].LessonType) {
    case "LABORATORY": temp.summary = temp.summary +  " (LAB)"; break;
    case "SECTIONAL TEACHING": temp.summary = temp.summary +  " (SEC)"; break;
    case "LECTURE": temp.summary = temp.summary + " (LECT)"; break;
    case "TUTORIAL": 
    case "TUTORIAL TYPE 2":
    case "TUTORIAL TYPE 3": temp.summary = temp.summary + " (TUT)"; break;
    case "RECITATION":  temp.summary = temp.summary + " (RECI)"; break;
  }
  switch(data.Timetable[classNo].DayText) {
    case "SUNDAY" :  semStart.setDate(semStart.getDate() + 7); break;
    case "SATURDAY" :  semStart.setDate(semStart.getDate() + 6); break;
    case "FRIDAY" : semStart.setDate(semStart.getDate() + 5); break;
    case "THURSDAY" : semStart.setDate(semStart.getDate() + 4); break;
    case "WEDNESDAY" : semStart.setDate(semStart.getDate() + 3); break;
    case "TUESDAY" : semStart.setDate(semStart.getDate() + 2); break;
    case "MONDAY" : semStart.setDate(semStart.getDate()+1); break;
  }
  semStart.setHours(parseInt(data.Timetable[classNo].StartTime.substring(0,2)-8));
  
  switch(data.Timetable[classNo].WeekText) {
    case "ODD&nbsp;WEEK": {
      temp.exclude.push(new Date(semStart.getTime() + 604800000)); //week 2
      temp.exclude.push(new Date(semStart.getTime() + 1814400000)); //week 4
      temp.exclude.push(new Date(semStart.getTime() + 3024000000)); //week 6
      temp.exclude.push(new Date(semStart.getTime() + 4838400000)); //week 9
      temp.exclude.push(new Date(semStart.getTime() + 6048000000)); //week 11 
      temp.exclude.push(new Date(semStart.getTime() + 7257600000)); //week 13
      
    } break;
    case "EVEN&nbsp;WEEK": {
      temp.exclude.push(new Date(semStart.getTime())); //week 1
      temp.exclude.push(new Date(semStart.getTime() + 1209600000)); //week 3    
      temp.exclude.push(new Date(semStart.getTime() + 2419200000)); //week 5
      temp.exclude.push(new Date(semStart.getTime() + 4233600000)); //week 8
      temp.exclude.push(new Date(semStart.getTime() + 5443200000)); //week 10       
      temp.exclude.push(new Date(semStart.getTime() + 6652800000)); //week 12
      temp.exclude.push(new Date(semStart.getTime() + 7862400000)); //week 14
      
    } break;
    case "EVERY&nbsp;WEEK": break;

  }
  temp.rrule.freq = "WEEKLY";
  //Recess week
  temp.exclude.push(new Date(semStart.getTime() + 3628800000));
  
  if(data.Timetable[classNo].LessonType == "TUTORIAL" || 
    data.Timetable[classNo].LessonType == "TUTORIAL TYPE 2" ||
    data.Timetable[classNo].LessonType == "TUTORIAL TYPE 3" ||
    data.Timetable[classNo].LessonType == "LABORATORY") {
      if(data.Timetable[classNo].WeekText !== "EVEN&nbsp;WEEK")
        temp.exclude.push(new Date(semStart.getTime()));
      if(data.Timetable[classNo].WeekText !== "ODD&nbsp;WEEK")
        temp.exclude.push(new Date(semStart.getTime() + 604800000));
  }
  temp.dateStart = new Date(semStart.getTime());
  semStart.setHours(parseInt(data.Timetable[classNo].EndTime.substring(0,2)-8));
  temp.dateEnd = new Date(semStart.getTime());
  temp.exclude.sort();
  //console.log("Class of " + temp.summary  + " start at "+ temp.dateStart);
  return temp;
}


//Build an event class for NUS module
//Output: An ics event class of NUS module FINAL EXAM
//Input : Data from NUSAPI, semester of the class,
//DEFAULT exam time is 3 hours
//NOTE: corrected to UTC
function buildNUSExam(data, semStart) {
  var examD = data.ExamDate,
      temp = {
        summary: data.ModuleCode + " (EXAM)",
        description: data.ModuleTitle, 
        rrule: {
          freq: "ONCE"
        },
        dateStart: new Date(parseInt(examD.substring(0,4)),
                        parseInt(examD.substring(5,7))-1,
                        parseInt(examD.substring(8,10)),
                        parseInt(examD.substring(11,13))-8),
        // location, dateEnd, exclude
  };
  temp.dateEnd = new Date(temp.dateStart.getTime() + 10800000);
  return temp;
}

// Return the semester start date 
//Output: Smester start date in js date format
//Input: year (eg. "2013-2014") and 
//       semester (eg. "1") string 
//NOTE: corrected to UTC timezone
function semesterStart(year,sem) {
  var semStart = new Date();
  switch(year) {

    case "2013-2014": {
      //13-01-2014 & 12-08-2013
      (sem=="1")?semStart.setTime(1376208000000): 
                 semStart.setTime(1389513600000);
    } break; 
    case "2012-2013": {
      //14-01-2013 & 13-08-2012
      (sem=="1")?semStart.setTime(1344758400000):
                 semStart.setTime(1358064000000);
    } break;
    case "2011-2012": {
      //09-01-2012 & 08-08-2011
      (sem=="1")?semStart.setTime(1312704000000):
                 semStart.setTime(1326009600000);
    } break;
    case "2010-2011": {
      //10-01-2011 & 09-08-2010
      (sem=="1")?semStart.setTime(1281254400000):
                 semStart.setTime(1294560000000);
    } break;
  }
  return semStart;
}


router.get('/', function (req,res) {
  //console.log("showing "+req.query.addr);
  
  //console.log(eventInfo);
  if(req.user) {
    extract(decodeURIComponent(req.query.addr), 
      function(err, eventInfo) {
        if(err) {console.log("err :'"+err+"'.");}
        else {
          console.log("Logged in as " + req.user.username);
          //console.log(eventInfo);
          console.log("Updating database...");        
          User.update({ username: req.user.username},
                      {$set: {events: eventInfo}},
                      {upsert: true},
                      function() {
                        console.log("Updated!!");
                        res.send(eventInfo);
          });
        }
    });
  }
  else {
      console.log("Not login yet.");
      res.redirect('/login');
  }
});


module.exports = router;