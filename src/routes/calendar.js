var express = require('express');
var router = express.Router();
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');

function loggedIn(req, res, next) {
  if (req.user) {
    next();  
  }
  else { 
    req.flash('error', 'Please log in.');
    res.redirect('/login');
  }
}

router.get('/group/:hash/:name', loggedIn, function(req, res) {
  res.format({

    'text/html': function() { // If html page is requested...
      var group_id = req.app.settings.hashids.decryptHex(req.params.hash);
      Group.findById(group_id, function(err, group) {
        if (err) { // Due to invalid hash that decrypts to empty...
          console.log(err);
          req.flash('error', 'There is no such group.');
          res.redirect('/group');
        }
        else if (!group) { // Group not found...
          req.flash('error', 'There is no such group.');
          res.redirect('/group');
        }
        else { // Group found!
          group.hash = req.app.settings.hashids.encryptHex(group._id);
          res.render('groupCalendar', { group: group });
        }
      });
    },

    'application/json': function() { // If JSON is requested...
      var userEvents = [];
      var group_id = req.app.settings.hashids.decryptHex(req.params.hash);
      Group.findById(group_id)
      .select('groupName members requested')
      .populate('members', 'calendars username')
      .lean()
      .exec(function(err, group) {
        if (err) { console.log(err); }
        else if (group) {
          var numUserQueried = 0;
          group.members.forEach(function(member, index) {
            User
            .findById(member._id)
            .populate('calendars')
            .lean()
            .exec(function(err, user) {
              if (err) { console.log(err); }
              else {
                group.members[index].events = [];
                user.calendars.forEach(function(calendar) {
                  group.members[index].events.push.apply(group.members[index].events, calendar.events);
                });

                numUserQueried++;
                if (numUserQueried >= group.members.length) {
                  res.send(group);
                }
              }
            });
          });
        };
      });
    }
  });
});

router.get('/user', loggedIn, function(req, res) {
  res.format({

    'text/html': function() { // If html page is requested...
      User
      .findOne({ username: req.user.username })
      .populate('groups')
      .populate('requests')
      .exec(function(err, user) {
        res.render('soloCalendar', {
          groups: user.groups,
          requests: user.requests
        });
      });
    },

    'application/json': function() { // If JSON is requested...
      User
      .findOne({username: req.user.username})
      .populate('calendars')
      .exec(function(err, user) {
        if (err) {
          console.log(err);
        }
        if (user) {
          if (user.calendars.length > 0) {
            res.send(user.calendars);
          }
          else { res.send([]); }
        }
        else {
          res.send(null);
        }
      });
    }
  });
});

module.exports = router;