var express = require('express');
var router = express.Router();
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');
var Calendar = require('../schema/calendarSchema');
var UserError = require('../userError.js');

router.use(User.ensureAuthenticated());

router.get('/group/:hash/:name', function(req, res, next) {
  res.error.redirect('/group');
  res.format({

    'text/html': function() { // If html page is requested...
      var group_id = Group.decryptHash(req.params.hash);
      Group.findById(group_id, function(err, group) {
        if (err) { return next(err); } // Due to invalid hash that decrypts to empty...
        else if (!group) { // Group not found...
          return next(new UserError('There is no such group.'));
        }
        else { // Group found!
          var isAdmin = group.hasUser(req.attach.user, 'admins');
          return res.render('groupCalendar', { group: group, isAdmin: isAdmin });
        }
      });
    },

    'application/json': function() { // If JSON is requested...
      var userEvents = [];
      var group_id = Group.decryptHash(req.params.hash);
      Group.findById(group_id)
      .select('groupName members requested')
      .lean()
      .exec(function(err, group) {
        if (err) { return next(err); }
        else if (group) {
          var numUserQueried = 0;
          var members = [];
          group.members.forEach(function(member, index) {
            User
            .findById(member._id)
            .populate('calendars')
            .exec(function(err, user) {
              if (err) { return next(err); }
              else if (!user.hasGroup(group)) { // Group has user, but user does not have group...
                group.members.splice(group.members.indexOf(member), 1);
              }
              else {
                members[index] = {};
                members[index]._id = user._id;
                members[index].username = user.username;
                members[index].display_name = user.display_name;
                members[index].color = member.color;
                members[index].events = [];
                user.calendars.forEach(function(calendar) {
                  if(calendar.hidden) {
                    calendar.events.forEach(function (event) {
                      event.summary = "";
                      event.description = "";
                      event.location = "";
                    });
                  }
                  members[index].events.push.apply(members[index].events, calendar.events);
                });

                numUserQueried++;
              }
              if (numUserQueried >= group.members.length) {
                group.members = members; // Replace with new members array.
                Calendar.findOne({ group: group._id }).lean()
                .exec(function(err, calendar) {
                  if (err) { return next(err); }
                  else if (calendar) {
                    group.calendar = calendar;
                    return res.send(group);
                  }
                })
              }
            });
          });
        };
      });
    }
  });
});

router.get('/user', function(req, res, next) {
  res.error.redirect = '/';
  res.format({

    'text/html': function() { // If html page is requested...
      User
      .findOne({ username: req.user.username })
      .populate('groups')
      .populate('requests')
      .exec(function(err, user) {
        if (err) { return next(err); }
        if (user) {
          return res.render('soloCalendar', {
            groups: user.groups,
            requests: user.requests
          });
        }
        else { return next(new UserError('?')); }
      });
    },

    'application/json': function() { // If JSON is requested...
      User
      .findOne({username: req.user.username})
      .populate('calendars')
      .exec(function(err, user) {
        if (err) { return next(err); }
        if (user) {
          if (user.calendars.length > 0) {
            return res.send(user.calendars);
          }
          else { return res.send([]); }
        }
        else { return next(new UserError('?')); }
      });
    }
  });
});

router.post('/', function (req, res, next) {
  Calendar.create({ name: req.body.name, events:[] }, 
    function (err, calendar) {
    if (err) { return next(err); }
    User.findOneAndUpdate({username:req.user.username},
      {$push:{calendars:calendar._id}}, function (err, user) {
        if(err) { return next(err); }
        calendar.user = user._id;
        calendar.save( function (err, calendar) {
          if(err) { return next(err); }
          else res.send(calendar);
        });
    });
  });
});

router.delete('/:calendar_id', function (req, res, next) {
  Calendar.findOneAndRemove({_id:req.params.calendar_id},
    function (err, calendar) {
      if (err) { return next(err); }
      User.findOneAndUpdate({username:req.user.username},
        {$pull:{calendar:calendar._id}}, function (err, user) {
          if(err) { return next(err); }
          else {
            return res.send({success:"Calendar "+calendar.name+" is removed."});
          }
      });
  });
});

router.put('/:calendar_id/privacy', function (req, res, next) {
  Calendar.findOne({_id:req.params.calendar_id})
  .exec( function (err, calendar) {
    if (err) { return next(err); }
    calendar.hidden = req.body.hidden;
    calendar.save( function (err, calendar) {
      if (err) { return next(err); }
      return res.send({success:"Privacy setting changed."});
    });
  });
});

router.put('/:calendar_id/color', function(req, res, next) {
  Calendar.findOne({ _id:req.params.calendar_id })
  .exec(function (err, calendar) {
    if (err) { return next(err); }
    calendar.color = req.body.color;
    calendar.save(function (err, calendar) {
      if (err) { return next(err); }
      return res.send({success:"Privacy setting changed."});
    });
  });
});

router.put('/:calendar_id/event/:event_id',
  function (req, res, next) {
  Calendar.findOne({_id:req.params.calendar_id,
    'events._id':req.params.event_id})
  .exec(function (err, calendar) {
    if (err) { return next(err); }
    var myEvent = calendar.events.id(req.params.event_id);
    myEvent.summary = req.body.summary;
    myEvent.description = req.body.description;
    myEvent.location = req.body.location;
    myEvent.rrule = {freq: req.body.rrule_freq,
                      count:req.body.rrule_count};
    myEvent.dateStart = req.body.date_start;
    myEvent.dateEnd = req.body.date_end;
    myEvent.exclude = req.body.exclude;
    calendar.save( function (err, calendar) {
      if (err) { return next(err); }
      return res.send({success:"Edited an event",
                calendar_id: req.params.calendar_id,
                eventInfo: calendar.events.id(req.params.event_id)
      });
    });
  });
});

router.post('/:calendar_id/event/',
  function (req, res, next) {
  Calendar.findOne({_id:req.params.calendar_id})
  .exec(function (err, calendar) {
    if (err) { return next(err); }
    calendar.events.push({
      summary: req.body.summary,
      description: req.body.description,
      location: req.body.location,
      rrule: {freq: req.body.rrule_freq,
              count:req.body.rrule_count},
      dateStart: req.body.date_start,
      dateEnd: req.body.date_end,
      exclude: req.body.exclude
    });
    calendar.save( function (err, calendar) {
      if (err) { return next(err); }
      return res.send({success:"Added an event",
                calendar_id: req.params.calendar_id,
                eventInfo: calendar.events[calendar.events.length-1]
      });
    });
  });
});

router.delete('/:calendar_id/event/:event_id', 
  function (req, res, next) {
  Calendar.findOne({_id:req.params.calendar_id,
    'events._id':req.params.event_id})
  .exec( function (err, calendar) {
    if (err) { return next(err); }
    calendar.events.id(req.params.event_id).remove();
    calendar.save( function (err, calendar) {
      if (err) { return next(err); }
      return res.send({success:"Calendar "+calendar.name+
                  " has been deleted."})
    });
  });
});

router.get('/', function(req, res, next) {
  res.redirect('/calendar/user');
});

module.exports = router;