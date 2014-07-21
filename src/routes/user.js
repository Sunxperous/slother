var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../schema/userSchema');
var Calendar = require('../schema/calendarSchema');
// /user/calendar
router.use(User.ensureAuthenticated());


router.get('/request', function (req, res, next) {
  User.findOne({username:req.user.username}, 
    function (err, user) {
      if (err) { return next(err); }
      else 
        return res.send(user.requests);
  });
});

router.put('/displayName', function (req, res, next) {
  User.findOne({username:req.user.username},
    function (err, user) {
    if (err) { return next(err); }
    user.display_name = req.body.disName;
    user.save( function (err, user) {
      if (err) { return next(err); }
      else
        return res.send({ success: "Username Changed."});
    });
   });
})

router.post('/createCalendar', function (req, res, next) {
  Calendar.create({
    name: req.body.name,
    events:[]
  }, function (err, calendar) {
    if (err) { return next(err); }
    User.findOneAndUpdate({username:req.user.username},
      {$push:{calendar:calendar._id}}, function (err, user) {
        if (err) { return next(err); }
        calendar.user = user._id;
        calendar.save( function (err, calendar) {
          if (err) { return next(err); }
          else 
            return res.send({success:"New calendar is created."});
        });
      });
  });
});

router.get('/', function (req, res, next) {
  res.format({
    'text/html': function() { // If html page is requested...
      User
      .findOne({ username: req.user.username })
      .populate('groups','groupName _id')
      .populate('requests','groupName _id')
      .populate('calendars','name hidden _id')
      .exec(function(err, user) {
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