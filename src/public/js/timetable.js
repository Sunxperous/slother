'use strict';

/*
http://nusmods.com/2013-2014/sem2/v1/#HY2242=21&SSA1201=21&HY2242=8W1&CS1010=61&CS2100=813&CS2100=21&SSA1201=8E1&HY2242=21&CS2100=21&CS2100=114&CS1010=82&GEK1008=21&GEK1008=8D18
{ "CS1010" : { "ExamDate" : "2014-04-30T17:00+0800",
      "Laboratory" : [  ],
      "Lecture" : [  ],
      "ModuleCode" : "CS1010",
      "ModuleTitle" : "Programming Methodology",
      "Sectional" : [ { "ClassNo" : "1",
            "DayText" : "TUESDAY",
            "EndTime" : "1300",
            "LessonType" : "SECTIONAL TEACHING",
            "StartTime" : "1000",
            "Venue" : "i3-0345",
            "WeekText" : "EVERY WEEK"
          } ],
      "Tutorial" : [ { "ClassNo" : "2",
            "DayText" : "FRIDAY",
            "EndTime" : "1400",
            "LessonType" : "TUTORIAL",
            "StartTime" : "1200",
            "Venue" : "COM1-B108",
            "WeekText" : "EVERY WEEK"
          } ]
    },
  "CS2100" : { "ExamDate" : "2014-04-29T09:00+0800",
      "Laboratory" : [ { "ClassNo" : "14",
            "DayText" : "THURSDAY",
            "EndTime" : "1700",
            "LessonType" : "LABORATORY",
            "StartTime" : "1600",
            "Venue" : "COM1-0114",
            "WeekText" : "EVERY WEEK"
          } ],
      "Lecture" : [ { "ClassNo" : "1",
            "DayText" : "WEDNESDAY",
            "EndTime" : "1400",
            "LessonType" : "LECTURE",
            "StartTime" : "1200",
            "Venue" : "i3-Aud",
            "WeekText" : "EVERY WEEK"
          },
          { "ClassNo" : "1",
            "DayText" : "THURSDAY",
            "EndTime" : "1500",
            "LessonType" : "LECTURE",
            "StartTime" : "1400",
            "Venue" : "i3-Aud",
            "WeekText" : "EVERY WEEK"
          }
        ],
      "ModuleCode" : "CS2100",
      "ModuleTitle" : "Computer Organisation",
      "Sectional" : [  ],
      "Tutorial" : [ { "ClassNo" : "13",
            "DayText" : "TUESDAY",
            "EndTime" : "1400",
            "LessonType" : "TUTORIAL",
            "StartTime" : "1300",
            "Venue" : "COM1-0208",
            "WeekText" : "EVERY WEEK"
          } ]
    },
  "GEK1008" : { "ExamDate" : "2014-04-28T13:00+0800",
      "Laboratory" : [  ],
      "Lecture" : [ { "ClassNo" : "1",
            "DayText" : "FRIDAY",
            "EndTime" : "1600",
            "LessonType" : "LECTURE",
            "StartTime" : "1400",
            "Venue" : "UT-AUD1",
            "WeekText" : "EVERY WEEK"
          } ],
      "ModuleCode" : "GEK1008",
      "ModuleTitle" : "Southeast Asia: A Changing Region",
      "Sectional" : [  ],
      "Tutorial" : [ { "ClassNo" : "D18",
            "DayText" : "FRIDAY",
            "EndTime" : "1800",
            "LessonType" : "TUTORIAL",
            "StartTime" : "1600",
            "Venue" : "ERC-SR11",
            "WeekText" : "ODD WEEK"
          } ]
    },
  "HY2242" : { "ExamDate" : "2014-05-07T09:00+0800",
      "Laboratory" : [  ],
      "Lecture" : [ { "ClassNo" : "1",
            "DayText" : "MONDAY",
            "EndTime" : "1200",
            "LessonType" : "LECTURE",
            "StartTime" : "1000",
            "Venue" : "AS4-0206",
            "WeekText" : "EVERY WEEK"
          },
          { "ClassNo" : "1",
            "DayText" : "THURSDAY",
            "EndTime" : "1400",
            "LessonType" : "LECTURE",
            "StartTime" : "1200",
            "Venue" : "AS4-0206",
            "WeekText" : "EVERY WEEK"
          }
        ],
      "ModuleCode" : "HY2242",
      "ModuleTitle" : "Singapore's Military History",
      "Sectional" : [  ],
      "Tutorial" : [ { "ClassNo" : "W1",
            "DayText" : "MONDAY",
            "EndTime" : "1200",
            "LessonType" : "TUTORIAL",
            "StartTime" : "1000",
            "Venue" : "AS1-0204",
            "WeekText" : "EVERY WEEK"
          } ]
    },
  "SSA1201" : { "ExamDate" : "2014-04-30T09:00+0800",
      "Laboratory" : [  ],
      "Lecture" : [ { "ClassNo" : "1",
            "DayText" : "MONDAY",
            "EndTime" : "1800",
            "LessonType" : "LECTURE",
            "StartTime" : "1600",
            "Venue" : "LT11",
            "WeekText" : "EVERY WEEK"
          } ],
      "ModuleCode" : "SSA1201",
      "ModuleTitle" : "Singapore Society",
      "Sectional" : [  ],
      "Tutorial" : [ { "ClassNo" : "E1",
            "DayText" : "WEDNESDAY",
            "EndTime" : "1800",
            "LessonType" : "TUTORIAL",
            "StartTime" : "1600",
            "Venue" : "AS1-0204",
            "WeekText" : "EVEN WEEK"
          } ]
    }
}
*/

var mock = JSON.parse('{"SSA1201":{"Lecture":[{"ClassNo":"1","LessonType":"LECTURE","WeekText":"EVERY&nbsp;WEEK","DayText":"MONDAY","StartTime":"1600","EndTime":"1800","Venue":"LT11"}],"Tutorial":[{"ClassNo":"E1","LessonType":"TUTORIAL","WeekText":"EVEN&nbsp;WEEK","DayText":"WEDNESDAY","StartTime":"1600","EndTime":"1800","Venue":"AS1-0204"}],"Sectional":[],"Laboratory":[],"ExamDate":"2014-04-30T09:00+0800","ModuleTitle":"Singapore Society","ModuleCode":"SSA1201"},"HY2242":{"Lecture":[{"ClassNo":"1","LessonType":"LECTURE","WeekText":"EVERY&nbsp;WEEK","DayText":"MONDAY","StartTime":"1000","EndTime":"1200","Venue":"AS4-0206"},{"ClassNo":"1","LessonType":"LECTURE","WeekText":"EVERY&nbsp;WEEK","DayText":"THURSDAY","StartTime":"1200","EndTime":"1400","Venue":"AS4-0206"}],"Tutorial":[{"ClassNo":"W1","LessonType":"TUTORIAL","WeekText":"EVERY&nbsp;WEEK","DayText":"MONDAY","StartTime":"1000","EndTime":"1200","Venue":"AS1-0204"}],"Sectional":[],"Laboratory":[],"ExamDate":"2014-05-07T09:00+0800","ModuleTitle":"Singapore\'s Military History","ModuleCode":"HY2242"},"GEK1008":{"Lecture":[{"ClassNo":"1","LessonType":"LECTURE","WeekText":"EVERY&nbsp;WEEK","DayText":"FRIDAY","StartTime":"1400","EndTime":"1600","Venue":"UT-AUD1"}],"Tutorial":[{"ClassNo":"D18","LessonType":"TUTORIAL","WeekText":"ODD&nbsp;WEEK","DayText":"FRIDAY","StartTime":"1600","EndTime":"1800","Venue":"ERC-SR11"}],"Sectional":[],"Laboratory":[],"ExamDate":"2014-04-28T13:00+0800","ModuleTitle":"Southeast Asia: A Changing Region","ModuleCode":"GEK1008"},"CS2100":{"Lecture":[{"ClassNo":"1","LessonType":"LECTURE","WeekText":"EVERY&nbsp;WEEK","DayText":"WEDNESDAY","StartTime":"1200","EndTime":"1400","Venue":"i3-Aud"},{"ClassNo":"1","LessonType":"LECTURE","WeekText":"EVERY&nbsp;WEEK","DayText":"THURSDAY","StartTime":"1400","EndTime":"1500","Venue":"i3-Aud"}],"Tutorial":[{"ClassNo":"13","LessonType":"TUTORIAL","WeekText":"EVERY&nbsp;WEEK","DayText":"TUESDAY","StartTime":"1300","EndTime":"1400","Venue":"COM1-0208"}],"Sectional":[],"Laboratory":[{"ClassNo":"14","LessonType":"LABORATORY","WeekText":"EVERY&nbsp;WEEK","DayText":"THURSDAY","StartTime":"1600","EndTime":"1700","Venue":"COM1-0114"}],"ExamDate":"2014-04-29T09:00+0800","ModuleTitle":"Computer Organisation","ModuleCode":"CS2100"},"CS1010":{"Lecture":[],"Tutorial":[{"ClassNo":"2","LessonType":"TUTORIAL","WeekText":"EVERY&nbsp;WEEK","DayText":"FRIDAY","StartTime":"1200","EndTime":"1400","Venue":"COM1-B108"}],"Sectional":[{"ClassNo":"1","LessonType":"SECTIONAL TEACHING","WeekText":"EVERY&nbsp;WEEK","DayText":"TUESDAY","StartTime":"1000","EndTime":"1300","Venue":"i3-0345"}],"Laboratory":[],"ExamDate":"2014-04-30T17:00+0800","ModuleTitle":"Programming Methodology","ModuleCode":"CS1010"}}');

var timetable = function() {

};

// Adds an event to be shown on the timetable.
// event object contains:
//   > day, name, venue, start time, end time
//     > name value should be concatenation of moduleCode/moduleTitle,
//       lesson type and class no.
var insertAndShowEvent = function(event) {
  var name = event.LessonType + ' ' + event.ClassNo;
  var venue = event.Venue;
  var start = parseInt(event.StartTime);
  var end = parseInt(event.EndTime);
  var day;

  switch (event.DayText) {
    case 'WEDNESDAY':
      day = 'WED';
  };

  var generateDiv = function(name, start, end) {
    var CELL_WIDTH = 60; // Cell width.
    var div = $('<div>');
    var duration = (end - start) / 100 * CELL_WIDTH; // Temporary.
    div.width(duration);
    div.css('background-color', '#c00'); // Temporary.
    div.text(name);
    return div;
  };

  var div = generateDiv(name, start, end);
  $('tr.' + day).children('td.12').append(div);
  $('tr.' + day).children('td.12').append(div.clone());
  $('tr.' + day).children('td.12').append(div.clone());
  $('tr.' + day).children('td.12').append(div.clone());
};

insertAndShowEvent(mock['CS2100'].Lecture[0]);