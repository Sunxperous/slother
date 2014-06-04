var express = require('express');
var router = express.Router();

var mock = '{"MA1101R":{"ExamDate":"2014-05-05T13:00+0800","ModuleTitle":"Linear Algebra I","ModuleCode":"MA1101R","Lecture":{"ClassNo":"SL1","LessonType":"LECTURE","WeekText":"EVERY&nbsp;WEEK","DayText":"THURSDAY","StartTime":"1600","EndTime":"1800","Venue":"LT25"},"Tutorial":{"ClassNo":"T02","LessonType":"TUTORIAL","WeekText":"EVERY&nbsp;WEEK","DayText":"TUESDAY","StartTime":"1400","EndTime":"1500","Venue":"S16-0433"}},"IS1103":{"ExamDate":"2014-05-02T14:30+0800","ModuleTitle":"Computing and Society","ModuleCode":"IS1103","Sectional":{"ClassNo":"1","LessonType":"SECTIONAL TEACHING","WeekText":"EVERY&nbsp;WEEK","DayText":"TUESDAY","StartTime":"1400","EndTime":"1700","Venue":"COM1-B103"}},"CS2010":{"ExamDate":"2014-04-28T17:00+0800","ModuleTitle":"Data Structures and Algorithms II","ModuleCode":"CS2010","Laboratory":{"ClassNo":"1","LessonType":"LABORATORY","WeekText":"EVERY&nbsp;WEEK","DayText":"TUESDAY","StartTime":"1400","EndTime":"1500","Venue":"COM1-B109"},"Lecture":{"ClassNo":"1","LessonType":"LECTURE","WeekText":"EVERY&nbsp;WEEK","DayText":"THURSDAY","StartTime":"1000","EndTime":"1200","Venue":"LT19"},"Tutorial":{"ClassNo":"1","LessonType":"TUTORIAL","WeekText":"EVERY&nbsp;WEEK","DayText":"WEDNESDAY","StartTime":"0900","EndTime":"1000","Venue":"COM1-0208"}},"CS1020":{"ExamDate":"2014-05-05T17:00+0800","ModuleTitle":"Data Structures and Algorithms I","ModuleCode":"CS1020","Laboratory":{"ClassNo":"1","LessonType":"LABORATORY","WeekText":"EVERY&nbsp;WEEK","DayText":"THURSDAY","StartTime":"1000","EndTime":"1200","Venue":"COM1-B109"},"Sectional":{"ClassNo":"1","LessonType":"SECTIONAL TEACHING","WeekText":"EVERY&nbsp;WEEK","DayText":"TUESDAY","StartTime":"1000","EndTime":"1200","Venue":"i3-Aud"},"Tutorial":{"ClassNo":"C03","LessonType":"TUTORIAL","WeekText":"EVERY&nbsp;WEEK","DayText":"WEDNESDAY","StartTime":"1300","EndTime":"1400","Venue":"COM1-0209"}},"CS1010":{"ExamDate":"2014-04-30T17:00+0800","ModuleTitle":"Programming Methodology","ModuleCode":"CS1010","Sectional":{"ClassNo":"1","LessonType":"SECTIONAL TEACHING","WeekText":"EVERY&nbsp;WEEK","DayText":"TUESDAY","StartTime":"1000","EndTime":"1300","Venue":"i3-0345"},"Tutorial":{"ClassNo":"1","LessonType":"TUTORIAL","WeekText":"EVERY&nbsp;WEEK","DayText":"FRIDAY","StartTime":"1000","EndTime":"1200","Venue":"COM1-B108"}}}'
mock = JSON.parse(mock);

router.get('/', function(req, res) {
  res.render('index', { title: 'Slother by Sloth', mock: mock });
});

module.exports = router;