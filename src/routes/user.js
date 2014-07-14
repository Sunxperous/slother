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


module.exports = router;