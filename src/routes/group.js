var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Schema = mongoose.Schema;
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');

//***************Middleware*******************************//

//Check logged in, else direct to login page
function loggedIn(req, res, next) {
  if (req.user) {
    next();  
  }
  else { 
    res.redirect('/login'); 
    res.send({error: "Please log in"});
  }
}
router.use(loggedIn);

function targetInGroup(positive, type) {
  return function(req, res, next) {
    var group = req.attach.group;
    var target = req.attach.target;
    if (group && target) { // Compulsory to have.
      var hasUser = group.hasUser(target, type);
      if (positive) { // We want user in group list...
        if (hasUser) { next(); } // ...yay!
        else { // ...nope, user is not in group list.
          res.send({ error: target.username+' is not part of '+type+' of the group '+group.groupName+'.' });
        }
      }
      else { // We don't want user in group list...
        if (hasUser) { // ...nope, user is in group list.
          res.send({ error: target.username+' is already part of '+type+' of the group '+group.groupName+'.' });
        }
        else { next(); } // ...yay!
      }
    }
  }
}

function userInGroup(positive, type) {
  return function(req, res, next) {
    var group = req.attach.group;
    var user = req.attach.user;
    if (group && user) { // Compulsory to have.
      var hasUser = group.hasUser(user, type);
      if (positive) { // We want user in group list...
        if (hasUser) { next(); } // ...yay!
        else { // ...nope, user is not in group list.
          res.send({ error: user.username+' is not part of '+type+' of the group '+group.groupName+'.' });
        }
      }
      else { // We don't want user in group list...
        if (hasUser) { // ...nope, user is in group list.
          res.send({ error: user.username+' is already part of '+type+' of the group '+group.groupName+'.' });
        }
        else { next(); } // ...yay!
      }
    }
  }
}

//*****************POST REQUEST*************************************//
// Post request to create new Group.
//  body
//    group_name: String
router.post('/createGroup', 
  User.attachLoggedIn(),
  function (req, res) {
    var user = req.attach.user;
    Group.create({
      groupName: req.body.group_name,
      members: [user._id],
      admins: [user._id],
      requested: [],
      created_by: user._id
    }, function (err, group) {
      if(err) { console.log(err); res.send(null); }
      else {
        user.groups.push(group._id);
        user.save(function (err, user) {
          if(err) { console.log(err); res.send(null); }
          else {
            res.redirect('/group');
          }
        });
      }
    });
});

// Post request to send invitation to user.
//  body
//    username: String
router.post('/:hash/invite',
  Group.ensureExistsByHash(true), // Attaches group.
  User.ensureExistsByUsername(true, ['body', 'username']), // Attaches target.
  User.attachLoggedIn(), // Attaches user.
  userInGroup(true, 'admins'),
  targetInGroup(false, 'members'),
  targetInGroup(false, 'requested'),
  function (req,res) {
    var group = req.attach.group;
    var target = req.attach.target;
    target.requests.push(group._id);
    group.requested.push(target._id);
    group.save(function(err) {
      if (err) { console.log(err); }
      target.save(function(err) {
        if (err) { console.log(err); }
        else { // Success.
          res.send({ success: 'Request has been sent to ' + target.username + '.' })
        }
      });
    });
  }
);

// //Post request to accept request
// router.post('/acceptInvitation', searchGroupAndRequest(true), 
//   function (req, res) {
//     Group.findOneAndUpdate({groupName: req.body.groupName},
//       {$push:{members:req.attach.requested._id}, 
//        $pull:{requested:req.attach.requested._id}},
//       function (err, group) {
//         if(err) { console.log(err); res.send(null); }
//         User.findOneAndUpdate({username:req.user.username},
//           {$push:{groups:group._id}, $pull:{requests:group._id}}, 
//           function (err, user) {
//             if(err) { console.log(err); res.send(null); }
//             res.send({sucess:"User "+req.user.username+
//                     " added into group "+req.body.groupName});
//         }); 
//     }); 
// });

// //Post request to reject invitation
// router.post('/rejectInvitation', searchGroupAndRequest(true), 
//   function (req, res) {
//     Group.findOneAndUpdate({groupName: req.body.groupName},
//       {$pull:{requested:req.attach.requested._id}},
//       function (err, group) {
//         if(err) { console.log(err); res.send(null); }
//         User.findOneAndUpdate({username:req.user.username},
//           {$pull:{requests:group._id}}, function (err, user) {
//             if(err) { console.log(err); res.send(null); }
//             res.send({sucess:"User "+req.user.username+
//                     " has rejected the invitation into group "+req.body.groupName});
//         }); 
//     }); 
// });
   
// //Post request to remove person to a group
// router.post('/removeMember', searchGroup(true), 
//   searchUserInGroup(true), function (req,res) {
//     var sent = false;
//     Group.findOneAndUpdate({groupName:req.body.groupName},
//       {$pull:{members:req.attach.member._id}}, 
//       function (err, group) {
//         if(err) { console.log(err); res.send(null); }
//         User.findOneAndUpdate({username:req.body.user},
//         {$pull:{groups:group._id}}, function (err, user) {
//           if(err) { console.log(err); res.send(null); }
//           if(group.members.length == 0 && !sent) {
//             sent = true;
//             group.remove(function (err, deleted) {
//               console.log("deleted");
//               res.send({success:"User "+req.body.user+
//                     " is removed from group, group deleted."});
//             });
//           }
//           else if(!sent) {
//             res.send({success:"User "+req.body.user+
//                     " is removed from group."});
//           }
//         });
//     });
// });

// Get request for list of groups of logged in user.
router.get('/', function(req, res) {
  User
  .findOne({ username: req.user.username })
  .populate('groups', 'groupName')
  .exec(function(err, user) {
    if (err) { console.log(err); }
    else if (user) {
      var hashids = req.app.settings.hashids;
      user.groups.forEach(function(group) {
        var base64_id = hashids.encryptHex(group._id), friendly_url;
        if (group.groupName) { // Because I entered an 'undefined' name previously...
          friendly_url = group.groupName.replace(/\s+/g, '-').toLowerCase();
        }
        group.url = '/calendar/group/' + base64_id + '/' + friendly_url;
      });
      res.render('groups', { groups: user.groups });
    }
  })
});

module.exports = router;