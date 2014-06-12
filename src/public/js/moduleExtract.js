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
//  Take note of delays from getJSON !!!
//  Manual enter of semStart date in line 44

function extract(addr) {
  var year = addr.substring(19,28),
      sem = addr.substring(32,33),
      modDetailInfo = {};
  addr = addr.substring(38);
  mod = addr.split("&");
  mod.sort();
  //console.log(mod); //For checking
  var tempMod = mod.pop().split("=");
  while(tempMod !== undefined) {
    
    var tempOb = {
      codeNo: tempMod[0],
      lect: [], lab: [], sect: [], tut: []
    };
    //console.log(tempOb);
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
  console.log(modDetailInfo);


  var semStart = new Date(2014,0,13,0,0,0,0);
  //Manual key in Monday as start day
  
  var tempURL = "http://api.nusmods.com/"+year+"/"
                +sem+'/modules/FE5218.json',
      tempModCode = "FE5218",
      eventInfo = [];
  for(var x in modDetailInfo) {
    tempURL = tempURL.replace(tempModCode,x); 
    tempModCode = x;
    $.getJSON(tempURL,function(data) {
      //Go through and copy each element.
      //First, handle normal lesson timetable.
      for(var y in data.Timetable) {
        var timetable = data.Timetable[y],
            lessonType = checkLessonTaken(timetable,
                      modDetailInfo[data.ModuleCode]);
        if(lessonType == false)
          continue;
        else
          eventInfo.push(buildNUSEvent(data,
            new Date(semStart.getTime()),y));
        }
      //Next, exam info
      eventInfo.push(buildNUSExam(data,
        new Date(semStart.getTime())));
    });
    //console.log(eventInfo);
  }
  return eventInfo;
}

//Return class type string
//Input: class no. from nusMods eg. MA2213= 8T04
function noToLessonType(lesson) {
  switch(lesson.substring(0,1)) {
  case '1': return "lab";
  case '2': return "lect";
  case '6': return "sect";
  case '8': return "tut";
  }
}


//Return boolean whether lesson is in user timetable
//Input:  timetable class from nusmods
//        lessonNo class grouped by lect,lab,tut,sect
function checkLessonTaken(timetable, lessonNo) {
  //console.log(lessonNo)
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
      case "SECTIONAL TEACHING": 
        for(var x in lessonNo.sect)
          return (timetable.ClassNo == 
            lessonNo.sect[x])?true:false;
      default: 
        console.log("Non-defined lesson-type")
        return false;
        //For error checking
  }
}

function buildNUSEvent(data, semStart, classNo) {
  //console.log("semStart = " + semStart + ", data = "+data.ModuleCode);
  var temp = {
        summary: data.ModuleCode,
        description: data.ModuleTitle + " - ClassNo: " 
                    + data.Timetable[classNo].ClassNo,
        location: data.Timetable[classNo].Venue,
        rrule: {
          freq: data.Timetable[classNo].WeekText,
          count: 14 //default semester week
        },
        exclude: []
         // dateStart, dateEnd, 
  };
  switch(data.Timetable[classNo].LessonType){
    case "LABORATORY": temp.summary = temp.summary +  " (LAB)"; break;
    case "SECTIONAL TEACHING": temp.summary = temp.summary +  " (SEC)"; break;
    case "LECTURE": temp.summary = temp.summary + " (LECT)"; break;
    case "TUTORIAL": temp.summary = temp.summary + " (TUT)"; break;
  }
  switch(data.Timetable[classNo].DayText){
    case "SUNDAY" :  semStart.setDate(semStart.getDate()+6); break;
    case "SATURDAY" :  semStart.setDate(semStart.getDate() + 5); break;
    case "FRIDAY" : semStart.setDate(semStart.getDate() + 4); break;
    case "THURSDAY" : semStart.setDate(semStart.getDate() + 3); break;
    case "WEDNESDAY" : semStart.setDate(semStart.getDate() + 2); break;
    case "TUESDAY" : semStart.setDate(semStart.getDate() + 1); break;
    case "MONDAY" : semStart.setDate(semStart.getDate()); break;
  }
  semStart.setHours(parseInt(data.Timetable[classNo].StartTime.substring(0,2)));
  if(data.Timetable[classNo].LessonType == "TUTORIAL" || 
    data.Timetable[classNo].LessonType == "LABORATORY") {
      semStart = new Date(semStart.getTime() + 1209600000);
  }
  temp.dateStart = new Date(semStart.getTime());
  semStart.setHours(parseInt(data.Timetable[classNo].EndTime.substring(0,2)));
  temp.dateEnd = new Date(semStart.getTime());
  switch(temp.freq){
    case "ODD WEEK": 
    case "EVEN WEEK": temp.count = 7;
    case "EVERY WEEK": break;
  }
  console.log("Class of " + temp.summary  + " start at "+ temp.dateStart);
  temp.exclude.push(new Date(temp.dateStart.getTime() + 3628800000));
  return temp;
}


function buildNUSExam(data, semStart) {
  var examD = data.ExamDate,
      temp = {
        summary: data.ModuleCode + " (EXAM)",
        description: data.ModuleTitle, 
        rrule: {
          freq: "ONCE"
        },
        dateStart: new Date(parseInt(examD.substring(0,4)),
                        parseInt(examD.substring(6,7))-1,
                        parseInt(examD.substring(8,10)),
                        parseInt(examD.substring(11,13))),
        // location, dateEnd, exclude
  };
  temp.dateEnd = new Date(temp.dateStart.getTime() + 10800000);
  console.log("Exam of " + temp.summary + " start at "+temp.dateStart)
  return temp;
}