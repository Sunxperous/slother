var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../schema/userSchema');
var Calendar = require('../schema/calendarSchema');
// /user/calendar

function loggedIn(req, res, next) {
  if (req.user) { 
    req.attach.myself = req.user;
    next();  
  }
  else { 
    res.redirect('/login'); 
    res.send({error: "Please log in"});
  }
}




router.get('/calendar', function(req, res) {
  if (req.user) {
    User
    .findOne({username: req.user.username})
    .populate('calendars')
    .exec(function(err, user) {
      if (err) {
        console.log(err);
      }
      if (user) {
        if (user.calendars.length > 0 && user.calendars[0].events) {
          res.send(user.calendars[0].events);
        }
        else { res.send(null); }
      }
      else {
        res.send(null);
      }
    });
  }
  else {
    res.send(null);
  }
});

router.get('/request', loggedIn, function (req, res) {
  User.findOne({username:req.user.username}, 
    function (err, user) {
      if(err) 
        res.send("err '"+err+"'.");
      else 
        res.send(user.requests);
  });
});

router.post('/createCalendar', loggedIn, function (req, res) {
  Calendar.create({
    name: req.body.name,
    events:[]
  }, function (err, calendar) {
    User.findOneAndUpdate({username:req.user.username},
      {$push:{calendar:calendar._id}}, function (err, user) {
        if(err) { console.log(err); res.send(null); }
        calendar.user = user._id;
        calendar.save( function (err, calendar) {
          if(err) { console.log(err); res.send(null); }
          else res.send({success:"New calendar is created."});
        });
      });
  });
});
/*
//Input type: 1 - create event
//            2 - modify event
//            3 - remove all repeated event
//            4 - exclude certain day of events
router.post('/event', loggedIn, function (req, res) {
  switch(req.type) {
    case 1: {
      Calendar.findOneAndUpdate({name:req.body.calendar},
        {$push:{ events:{
            summary: req.body.summary,
            dateStart: req.body.date_start,
            date_end: req.body.date_end,
            rrule:{
              freq: req.body.rrule_freq,
              count: req.body.rrule_count
            }
          }}}, function (err, calendar) {
            if(err) { console.log(err); res.send(null); }
            else res.send({success:"Event added."});
      });
    } break;
    case 2: {

    } break;
    case 3: {
      Calendar.findOneAndUpdate({name:req.body.calendar},
        {$pull:{ events: {
            summary: req.body.summary,
            dateStart: req.body.date_start,
            date_end: req.body.date_end,
            rrule:{
              freq: req.body.rrule_freq,
              count: req.body.rrule_count
            }
          }}}, function (err, calendar) {
            if(err) { console.log(err); res.send(null); }
            else res.send({success:"Event removed."});
      });
    } break;
    case 4: {
      Calendar.findOneAndUpdate({name:req.body.calendar},
        {$pull:{ events: {
            summary: req.body.summary,
            dateStart: req.body.date_start,
            date_end: req.body.date_end,
            rrule:{
              freq: req.body.rrule_freq,
              count: req.body.rrule_count
            }
          }
        }, $push:{ events: {
            summary: req.body.summary,
            dateStart: req.body.date_start,
            date_end: req.body.date_end,
            rrule:{
              freq: req.body.rrule_freq,
              count: req.body.rrule_count
            }
            exclude:[req.body.exlclude]
        }}}, function (err, calendar) {
            if(err) { console.log(err); res.send(null); }
            else {
              
              res.send({success:"Event removed."});
            }
      });
    } break;
  }
});
*/
module.exports = router;