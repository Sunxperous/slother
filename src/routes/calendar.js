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



router.post('/event', loggedIn, function (req, res) {
  console.log(req.body);
  if(req.body.type == 1) {
    Calendar.findOneAndUpdate({_id:req.body.calendar_id},
      {$push:{events:{summary:req.body.summary,
                description: req.body.description,
                location:req.body.location,
                rrule:{freq: req.body.rrule_freq,
                  count:req.body.rrule_count},
                dateStart:req.body.date_start,
                dateEnd:req.body.date_end,
                exclude:[]}}
      }, function (err, calendar) {
        console.log(calendar);
        res.send("Added");
    });
  }
  else if(req.body.type == 2) {
    Calendar.findOneAndUpdate({_id:req.body.calendar_id,'events._id':req.body.event_id},
      {$set:{"events.$.summary":req.body.summary,
        "events.$.description": req.body.description,
        "events.$.location":req.body.location,
        "events.$.rrule":{freq: req.body.rrule_freq,
                count:req.body.rrule_count},
        "events.$.dateStart":req.body.date_start,
        "events.$.dateEnd":req.body.date_end}}, 
      function (err, calendar) {
        console.log("Updated");
        console.log(calendar._id);
        for(var x in calendar.events)
          if(calendar.events[x]._id == req.body.event_id)
            {console.log(calendar.events[x]); console.log(calendar.events[x].description)}             
        res.send("Operation success");
    });
  }
  else if(req.body.type == 3) {
    Calendar.findOneAndUpdate({_id:req.body.calendar_id,'events._id':req.body.event_id},
      {$pull:{events:{_id:req.body.event_id}}}, function (err, calendar) {
        console.log(calendar);

        if(calendar)
         for(var x in calendar.events)
          if(calendar.events[x]._id == req.body.event_id)
            {console.log(calendar.events[x]); console.log(calendar.events[x].description)}             
        res.send("Removed.")
      });
  }
  else if(req.body.type == 4) {
    Calendar.findOneAndUpdate({_id:req.body.calendar_id,'events._id':req.body.event_id},
      {$push:{"events.$.exclude":req.body.date_start}}, 
      function (err, calendar) {
        console.log("Excluded");
        console.log(calendar);
        for(var x in calendar.events)
          if(calendar.events[x]._id == req.body.event_id)
            {console.log(calendar.events[x].exclude); console.log(calendar.events[x].description)}             
        res.send("Excluded");
    });
  }
  else if(req.body.type == 5) {}
});


//Input type: 1 - create event
//            2 - modify event
//            3 - remove all repeated event
//            4 - exclude certain day of events
//            5 - end early
// router.post('/event', loggedIn, function (req, res) {
//   switch(req.type) {
//     case 1: {
//       Calendar.findOneAndUpdate({name:req.body.calendar},
//         {$push:{ events:{
//             summary: req.body.summary,
//             dateStart: req.body.date_start,
//             date_end: req.body.date_end,
//             rrule:{
//               freq: req.body.rrule_freq,
//               count: req.body.rrule_count
//             }
//           }}}, function (err, calendar) {
//             if(err) { console.log(err); res.send(null); }
//             else res.send({success:"Event added."});
//       });
//     } break;
//     case 2: {

//     } break;
//     case 3: {
//       Calendar.findOneAndUpdate({name:req.body.calendar},
//         {$pull:{ events: {
//             summary: req.body.summary,
//             dateStart: req.body.date_start,
//             date_end: req.body.date_end,
//             rrule:{
//               freq: req.body.rrule_freq,
//               count: req.body.rrule_count
//             }
//           }}}, function (err, calendar) {
//             if(err) { console.log(err); res.send(null); }
//             else res.send({success:"Event removed."});
//       });
//     } break;
//     case 4: {
//       Calendar.findOneAndUpdate({name:req.body.calendar},
//         {$pull:{ events: {
//             summary: req.body.summary,
//             dateStart: req.body.date_start,
//             date_end: req.body.date_end,
//             rrule:{
//               freq: req.body.rrule_freq,
//               count: req.body.rrule_count
//             }
//           }
//         }, $push:{ events: {
//             summary: req.body.summary,
//             dateStart: req.body.date_start,
//             date_end: req.body.date_end,
//             rrule:{
//               freq: req.body.rrule_freq,
//               count: req.body.rrule_count
//             }
//             exclude:[req.body.exlclude]
//         }}}, function (err, calendar) {
//             if(err) { console.log(err); res.send(null); }
//             else {
              
//               res.send({success:"Event removed."});
//             }
//       });
//     } break;
//     case 5: {
//       Calendar.findOne({name:req.body.calendar})
//       .exec(function (err, calendar) {
//         calendar.update({ calendar.events._id: req.body._id},
//         {$set:{.$}})
//       })
//     } break;
//   }
// });

module.exports = router;