var express = require('express');
var router = express.Router();
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');
var Calendar = require('../schema/calendarSchema');
var UserError = require('../userError.js');
var moment = require('moment');
var async = require('async');

router.use(User.ensureAuthenticated());

router.param('hash', Group.ensureExistsByHash());

function validateDates(startDate, endDate) {
  var dateStart = moment(startDate);
  var dateEnd = moment(endDate);
  if (!dateStart.isValid()) {
    return new UserError('Start date is invalid.');
  }
  if (!dateEnd.isValid()) {
    return new UserError('End date is invalid.');
  }
  if (dateStart.isAfter(dateEnd)) {
    return new UserError('Start date should not be after end date.');
  }
  if (dateStart.day() !== dateEnd.day()) {
    return new UserError('Overnight events not supported yet.');
  }
  return null;
}

function ownership (message) {
  return function (req, res, next) {
    var calendar = req.attach.calendar;
    if(calendar.group) {
      Group.findById(calendar.group, function (err, group) {
        if (err) { return next(err); }
        else if(group == null) 
          return next(new UserError("No such group."));
        else
          if (group.hasUser(req.attach.user, Group.roles.ADMIN)) {
            return next();
          }
          return next(new UserError('Not authorized to modify group calendar.'));
      });
    }
    else{
      if(calendar.user.toString() == req.attach.user._id.toString()) {
        return next();
      }
      else
        return next(new UserError(message));
    }
  }
}


router.get('/group/:hash/:name',
  function(req, res, next) { res.error.redirect = '/group'; next(); },
  Group.userIsType('user', true, Group.roles.MEMBER, 'You are not a member of this group.'),
  function(req, res, next) {
  res.format({
    'text/html': function() { // If html page is requested...
      var group_id = Group.decryptHash(req.params.hash);
      Group.findById(group_id, function(err, group) {
        if (err) { return next(err); } // Due to invalid hash that decrypts to empty...
        else if (!group) { // Group not found...
          return next(new UserError('There is no such group.'));
        }
        else { // Group found!
          var isAdmin = group.hasUser(req.attach.user, Group.roles.ADMIN);
          var isOwner = group.hasUser(req.attach.user, Group.roles.OWNER);
          return res.render('groupCalendar', { group: group, isAdmin: isAdmin, isOwner: isOwner });
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
                      event.summary = members[index].display_name;
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
                });
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
      .populate('calendars')
      .exec(function(err, user) {
        if (err) { return next(err); }
        if (user) {
          return res.render('soloCalendar');
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
          var calendars = [];
          user.calendars.forEach(function(calendar) {
            calendars.push(calendar);
          });
          async.each(user.groups, function(group_id, callback) {
            Calendar.findOne({ group: group_id }, function(err, calendar) {
              if (err) { return callback(err); }
              calendars.push(calendar);
              return callback();
            });
          }, function(err) {
            if (err) { return next(err); }
            return res.send(calendars);
          });
        }
        else { return next(new UserError('?')); }
      });
    }
  });
});
// ensureExist = function (positive, message)
// ownership = function (type, message, groupId)
//Create calendar
router.post('/', function (req, res, next) {
  Calendar.create({ name: req.body.name, events:[],user: req.attach.user._id }, 
    function (err, calendar) {
    if (err) { return next(err); }
    req.attach.user.calendars.push(calendar._id);
    req.attach.user.save( function (err, user) {
      if(err) { return next(err); }
      return res.send({calendar:calendar,
                      success:"A generic calendar is created."
                      });
    });
  });
});

router.delete('/:calendar_id', 
  Calendar.ensureExist(true,'There is no such calendar.'),
  function (req, res, next) {
  Calendar.findOne({_id:req.params.calendar_id})
  .exec( function (err, calendar) {
    if (err) { return next(err); }
    calendar.remove( function (err, calendarD) {
      if (err) { return next(err); }
      req.attach.user.calendars.remove(req.params.calendar_id);
      req.attach.user.save( function (err, user) {
        if (err) { return next(err); }
        return res.send({ success:"Calendar "+calendar.name+" is removed."});
      });
    });
  });
});

//Change privacy setting
router.put('/:calendar_id/privacy', 
  Calendar.ensureExist(true,'There is no such calendar.'),
  ownership('The calendar is not owned by you.'),
  function (req, res, next) {
  Calendar.findOne({_id:req.params.calendar_id})
  .exec( function (err, calendar) {
    if (err) { return next(err); }
    calendar.hidden = req.body.privacy;
    calendar.save( function (err, calendar) {
      if (err) { return next(err); }
      return res.send({success:"Privacy setting changed."});
    });
  });
});

//Change color setting
router.put('/:calendar_id/color',
  Calendar.ensureExist(true,'There is no such calendar.'),
  ownership('The calendar is not owned by you.'),
  function (req, res, next) {
  Calendar.findOne({ _id:req.params.calendar_id })
  .exec(function (err, calendar) {
    if (err) { return next(err); }
    calendar.color = req.body.color;
    calendar.save(function (err, calendar) {
      if (err) { return next(err); }
      return res.send({success:"Color setting changed."});
    });
  });
});


//Change name setting
router.put('/:calendar_id/name',
  Calendar.ensureExist(true,'There is no such calendar.'),
  ownership('The calendar is not owned by you.'), 
  function (req, res, next) {
  Calendar.findOne({_id:req.params.calendar_id})
  .exec( function (err, calendar) {
    if (err) { return next(err); }
    calendar.name = req.body.name;
    calendar.save( function (err, calendar) {
      if (err) { return next(err); }
      return res.send({success:"Name changed."});
    });
  });
});

//Modify event
router.put('/:calendar_id/event/:event_id',
  Calendar.ensureExist(true,'There is no such calendar.'),
  ownership('The calendar is not owned by you.'), 
  function (req, res, next) {
  Calendar.findOne({_id:req.params.calendar_id,
    'events._id':req.params.event_id})
  .exec(function (err, calendar) {
    if (err) { return next(err); }
    var dateValidation = validateDates(req.body.date_start, req.body.date_end);
    if (dateValidation) { return next(dateValidation); }
    
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

//Create event
router.post('/:calendar_id/event/',
  Calendar.ensureExist(true,'There is no such calendar.'),
  ownership('The calendar is not owned by you.'), 
  function (req, res, next) {
  Calendar.findOne({_id:req.params.calendar_id})
  .exec(function (err, calendar) {
    if (err) { return next(err); }
    var dateValidation = validateDates(req.body.date_start, req.body.date_end);
    if (dateValidation) { return next(dateValidation); }

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

//Delete event
router.delete('/:calendar_id/event/:event_id', 
  Calendar.ensureExist(true,'There is no such calendar.'),
  ownership('The calendar is not owned by you.'), 
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

router.get('/:calendar_id',
  Calendar.ensureExist(true, 'There is no such calendar.'),
  function (req, res, next) {
    var calendar = req.attach.calendar;
    if (calendar.group) {
      Group.findById(calendar.group, function(err, group) {
        if (err) { return next(err); }
        return res.redirect(group.getUrl());
      });
    }    
    else {
      return res.redirect('/calendar/user');
    }
  }
);

router.get('/', function (req, res, next) {
  res.redirect('/calendar/user');
});

module.exports = router;
