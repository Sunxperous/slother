//  extract module info from nusmods address.
//  Input: addr - address of nusmods 
//  Output: Object of modules info.
//  Output format eg.: <Object Name>.<Module Code>.<Info>
//  Info includes: ModuleCode, ModuleTitle, Timetable
//  Take note of delays from getJSON !!!
function extract(addr) {
  var str = addr;
  str = str.substring(38);
  var mod = str.split("&"); 
  mod.sort(); 
  console.log(mod);
  var module = new Object();
  var tempMod = mod.pop();
  tempMod = tempMod.split("=");
  while(true) {
    
    var modName = tempMod[0];
    var tempOb = {};
    while(tempMod[0] == modName) {
        tempOb.codeNo = modName;
        if(tempMod[1].substring(0,1)=='1') {
          tempOb.lab = tempMod[1].substring(1);
        }
        else if(tempMod[1].substring(0,1)=='2') {
          tempOb.lect = tempMod[1].substring(1);
        }
        else if(tempMod[1].substring(0,1)=='6') {
          tempOb.sect = tempMod[1].substring(1);
        }
        else if(tempMod[1].substring(0,1)=='8') {
          tempOb.tut = tempMod[1].substring(1);
        }
        tempMod = mod.pop();
        if(tempMod== undefined)
          break;
        tempMod = tempMod.split("=");
    }
    module[modName] = tempOb;
    if(tempMod== undefined)
      break;
    module[modName] = tempOb;
  }

  var tempURL = "http://api.nusmods.com/2013-2014/2/modules/FE5218.json",
      tempCode = "FE5218";
  for(var x in module) {
    var y = 0;
    tempURL = tempURL.replace(tempCode,x);
    tempCode = x;
    var obj = [];
    var objt = $.getJSON(tempURL,function(data) {
      obj[data.ModuleCode] = {};
      //Go through and copy each element.
      //First: ExamDate.
      obj[data.ModuleCode].ExamDate = data.ExamDate;
      //Next,Module Title and code.
      obj[data.ModuleCode].ModuleTitle = data.ModuleTitle;
      obj[data.ModuleCode].ModuleCode = data.ModuleCode;

      //Next,timetable.
      for(y in data.Timetable) {
        if(data.Timetable[y].LessonType == "LECTURE" && 
            data.Timetable[y].ClassNo == module[data.ModuleCode].lect )
          obj[data.ModuleCode].Lecture = data.Timetable[y];
        else if(data.Timetable[y].LessonType == "LABORATORY" && 
            data.Timetable[y].ClassNo == module[data.ModuleCode].lab )
          obj[data.ModuleCode].Laboratory = data.Timetable[y];
        else if(data.Timetable[y].LessonType == "SECTIONAL TEACHING" && 
            data.Timetable[y].ClassNo == module[data.ModuleCode].sect )
          obj[data.ModuleCode].Sectional = data.Timetable[y];
        else if(data.Timetable[y].LessonType == "TUTORIAL" && 
            data.Timetable[y].ClassNo == module[data.ModuleCode].tut )
          obj[data.ModuleCode].Tutorial = data.Timetable[y];
      }
      //console.log(obj);
    });
  }
  return obj;
}