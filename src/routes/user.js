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

router.put('/displayName', function (req, res, err) {
  User.findOne({username:req.user.username},
   function (err, user) {
    user.display_name = req.body.disName;
    user.save( function (err, user) {
      res.send({ success: "Username Changed."});
    })
   })
})

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

router.get('/', function(req, res) {
  res.format({
    'text/html': function() { // If html page is requested...
      User
      .findOne({ username: req.user.username })
      .populate('groups','groupName _id')
      .populate('requests','groupName _id')
      .populate('calendars','name hidden _id')
      .exec(function(err, user) {
        user.groups.forEach(function(group) {
          var friendly_url;
          friendly_url = group.groupName.replace(/\s+/g, '-').toLowerCase();
          group.url = '/calendar/group/' + group.getHash() + '/' + friendly_url;
        });
        res.render('user', {
          username: user.username,
          groups: user.groups,
          requests: user.requests,
          displays: user.display_name,
          calendar: user.calendars
        });
      });
    },
  });
});


module.exports = router;