var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../schema/userSchema');

// /user/calendar
router.get('/calendar', function(req, res) {
  if (req.user) {
    User.findOne({username: req.user.username}, function(err, user) {
      if (err) {
        console.log(err);
      }
      if (user) {
        res.send(user.events);
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

router.get('/request', function (req, res) {
  if(req.user) {
    User.findOne({username:req.user.username}, function (err, user) {
      if(err) 
        res.send("err '"+err+"'.");
      else 
        res.send(user.request);
    })
  }
});

// //Compulsory info: name,freq,dateStart,dateEnd
// //Optional info: description,repeat,location,exclude array
// router.post('/addEvent', function (req, res) {
//   if(req.user) {
//     var tempEvent = {
//       summary: req.body.name,
//       rrule: {
//           freq: req.body.freq,
//         },
//       dateStart: req.body.dateStart,
//       dateEnd: req.body.dateEnd
//     };
//     if(req.body.exclude) tempEvent.exclude = req.body.exclude;
//     if(req.body.repeat) tempEvent.rrule.count = req.body.repeat;
//     if(req.body.location) tempEvent.location = req.body.location;
//     if(req.body.description) tempEvent.rrule.description = req.body.description;
//     User.findOneAndUpdate({username: req.user.username},
//       {$push:{events:tempEvent}}, function (err, user) {
//         res.send("Event added.");
//       })
//   }
// });

// //Compulsory info: name,freq,dateStart,dateEnd
// //Optional info: description,repeat,location,exclude[]
// // If is partial remove, info: excludeDate
// //                       boolean check: partial
// // If is edit          , boolean check: edit
// // As accurate as possible to prevent similar event from being remoed
// router.post('/removeEvent', function (req, res) {
//   if(req.user) {
//     var originalEvent = {
//       summary: req.body.name,
//       rrule: {
//           freq: req.body.freq,
//         },
//       dateStart: req.body.dateStart,
//       dateEnd: req.body.dateEnd
//     };
//     if(req.body.exclude) originalEvent.exclude = req.body.exclude;
//     if(req.body.repeat) originalEvent.rrule.count = req.body.repeat;
//     if(req.body.location) originalEvent.location = req.body.location;
//     if(req.body.description) originalEvent.rrule.description = req.body.description;
    
//     if(!req.body.partial) {
//       User.findOneAndUpdate({username: req.user.username, events:{$in:[tempEvent]}},
//         {$pull:{events:{$in:[tempEvent]}}}, function (err,user) {
//           if(err) 
//             res.send("err '"+err+"'.");
//           else if(user == null)
//             res.send("Event not found.");
//           else if(req.body.partial) {
//             originalEvent.exclude.push(excludeDate);
//             User.findOneAndUpdate({username: req.user.username, events:{$in:[tempEvent]}},
//               {$pull:{events:{$in:[tempEvent]}}}, function (err, user) {
//                 if(err)
//                   res.send("err '"+err+"'.");
//                 else if(user !== null) 
//                   res.send("Event removed");
//                 else
//                   res.send("Event not found.");
//             });
//           }
//           else  
//             res.send("Event removed");

//       });
//     }
//     else {
//       User.findOneAndUpdate({username: req.user.username, events:{$in:[tempEvent]}},
//         {$push:{events:{$in:[]}}}, function (err,user) {
//           if(err) 
//             res.send("err '"+err+"'.");
//           else if(user !== null) 
//             res.send("Event removed");
//           else
//             res.send("Event not found.");
//         });
//     }
//   }
//   else
//     res.send(null);
// });

module.exports = router;