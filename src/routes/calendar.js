var express = require('express');
var router = express.Router();
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');
var Calendar = require('../schema/calendarSchema');

function loggedIn(req, res, next) {
  if (req.user) {
    req.attach.myself = req.user;
    next();  
  }
  else { 
    req.flash('error', 'Please log in.');
    res.redirect('/login');
  }
}

router.get('/group/:hash/:name', loggedIn,
  User.attachLoggedIn(), // Attaches user.
  function(req, res) {
  res.format({

    'text/html': function() { // If html page is requested...
      var group_id = Group.decryptHash(req.params.hash);
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
          var isAdmin = group.hasUser(req.attach.user, 'admins');
          res.render('groupCalendar', { group: group, isAdmin: isAdmin });
        }
      });
    },

    'application/json': function() { // If JSON is requested...
      var userEvents = [];
      var group_id = Group.decryptHash(req.params.hash);
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
                  if(calendar.hidden) {
                    calendar.events.forEach(function (eve) {
                      eve.summary = "";
                      eve.description = "";
                      eve.location = "";
                    });
                  }
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

router.post('/', loggedIn, function (req, res) {
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

router.delete('/deleteCalendar', loggedIn, function (req, res) {
  Calendar.findOneAndRemove({_id:req.body.calendar_id},
    function (err, calendar) {
      User.findOneAndUpdate({username:req.user.username},
        {$pull:{calendar:calendar._id}}, function (err, user) {
          if(err) { console.log(err); res.send(null); }
          else res.send({success:"Calendar "+calendar.name+" is removed."});
        });
      });
  });
});

router.put('/:calendar_id/events/:event_id', loggedIn, 
  function (req, res) {
  Calendar.findOne({_id:req.body.calendar_id})
  .exec(function (err, calendar) {
    var myEvent = calendar.events.id(req.body.event_id);
    myEvent.summary = req.body.summary;
    myEvent.description = req.body.description;
    myEvent.location = req.body.location;
    myEvent.rrule = {freq: req.body.rrule_freq,
                      count:req.body.rrule_count};
    myEvent.dateStart = req.body.date_start;
    myEvent.dateEnd = req.body.date_end;
    calendar.save( function (err, calendar) {
      console.log(calendar);
      res.send({success:"Added new event"});

router.delete('/:calendar_id/events/:event_id', loggedIn, 
  function (req, res) {
  Calendar.findOneAndUpdate({_id:req.body.calendar_id,
    'events._id':req.body.event_id})
  .exec( function (err, calendar) {
    calendar.events.id(req.body.event_id).remove();
    calendar.save( function (err, calendar) {
      console.log(calendar);
      res.send({success:"Calendar "+calendar.name+
                  " has been deleted."})
    });
  });
});

router.get('/', function(req, res) {
  res.redirect('/calendar/user');
});

module.exports = router;