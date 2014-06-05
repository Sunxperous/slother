//  extract module info from nusmods address.
//  Input        : address of nusmods 
//  Output       : Object of modules info.
//  Output format: <Object Name>.<Module Code>.<Info>
//  Info includes: ModuleCode, ModuleTitle, 
//                 Lecture array, Tutorial array, 
//                 Sectional array and Lab array
//  Example link: http://nusmods.com/2013-2014/sem2/
//                v1/#IS1103=63&ST2334=2SL1&ST2334=
//                8T9&ST2334=2SL1
//
//  Take note of delays from getJSON !!!


function extract(addr) {
  var year = addr.substring(19,28),
      sem = addr.substring(32,33),
      modDetailInfo = {};
  addr = addr.substring(38);
  mod = addr.split("&");
  mod.sort();
  console.log(mod); //For checking
  var tempMod = mod.pop().split("=");
  while(true) {
    
    var tempOb = {
      codeNo: tempMod[0],
      lect: [], lab: [], sect: [], tut: []
    };
    console.log(tempOb);
    while(tempMod[0] == tempOb.codeNo) {
        tempOb[noToLessonType(tempMod[1])].
          push(tempMod[1].substring(1));  
        tempMod = mod.pop();
        if(tempMod== undefined) { break; }
        else 
          tempMod = tempMod.split("="); 
    }
    modDetailInfo[tempOb.codeNo] = tempOb;
    if(tempMod== undefined) { break; }
  }
  console.log(modDetailInfo);


  var tempURL = "http://api.nusmods.com/"+year+"/"
                +sem+'/modules/FE5218.json',
      tempModCode = "FE5218",
      modBriefInfo = {};
  for(var x in modDetailInfo) {
    var y = 0;
    tempURL = tempURL.replace(tempModCode,x); 
    tempModCode = x;
    $.getJSON(tempURL,function(data) {
      modBriefInfo[data.ModuleCode] = {
        Lecture: [], Tutorial: [], 
        Sectional: [], Laboratory: []
      };
      
      //Go through and copy each element.
      //First: ExamDate.
      modBriefInfo[data.ModuleCode].ExamDate =
        data.ExamDate;
      //Next,Module Title and code.
      modBriefInfo[data.ModuleCode].ModuleTitle = 
        data.ModuleTitle;
      modBriefInfo[data.ModuleCode].ModuleCode = 
        data.ModuleCode;

      //Next,timetable.
      for(y in data.Timetable) {
        if(data.Timetable[y].LessonType == "LECTURE" && 
            data.Timetable[y].ClassNo == modDetailInfo[data.ModuleCode].lect )
          modBriefInfo[data.ModuleCode].Lecture.push(data.Timetable[y]);
        else if(data.Timetable[y].LessonType == "LABORATORY" && 
            data.Timetable[y].ClassNo == modDetailInfo[data.ModuleCode].lab )
          modBriefInfo[data.ModuleCode].Laboratory.push(data.Timetable[y]);
        else if(data.Timetable[y].LessonType == "SECTIONAL TEACHING" && 
            data.Timetable[y].ClassNo == modDetailInfo[data.ModuleCode].sect )
          modBriefInfo[data.ModuleCode].Sectional.push(data.Timetable[y]);
        else if(data.Timetable[y].LessonType == "TUTORIAL" && 
            data.Timetable[y].ClassNo == modDetailInfo[data.ModuleCode].tut )
          modBriefInfo[data.ModuleCode].Tutorial.push(data.Timetable[y]);
      }
    });
  }
  return modBriefInfo;
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


// //Return boolean whether lesson is in user timetable
// function checkLessonNo(timetable, lessonNo) {
//   for(var x in lessonNo) {
//     switch(timetable.LessonType) {
//       case "LECTURE": 
//       case "LABORATORY": 
//       case "TUTORIAL":
//       case "SECTIONAL TEACHING": 
//         return (timetable.ClassNo == lessonNo);
//       default: return false;
//     }
//   }
// }
