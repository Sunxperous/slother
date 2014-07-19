var express = require('express');
var router = express.Router();
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');
var Calendar = require('../schema/calendarSchema');

//***************Middleware*******************************//
router.use(User.ensureAuthenticated());

// Searches given _user in group[type], depending on positive.
function userInGroup(_user, positive, type) {
  return function(req, res, next) {
    var group = req.attach.group;
    var user = req.attach[_user];
    if (group && user) { // Compulsory to have.
      var hasUser = group.hasUser(user, type) && user.hasGroup(group);
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
router.post('/', 
  function(req, res, next) {
    var user = req.attach.user;
    Group.create({
      groupName: req.body.group_name,
      members: [{ _id: user._id }],
      admins: [user._id],
      requested: [],
      created_by: user._id
    }, function(err, group) {
      if (err) {
        if (err.name === 'ValidationError') {
          req.flash('error', err.message);
          res.redirect('/group');
        }
        else {
          console.log(err);
        }
      }
      else if (group) {
        Calendar.create({
          name: group.groupName, group: group._id
        }, function(err, calendar) {
          if (err) { console.log(err); }
          else if (calendar) {
            user.groups.push(group._id);
            user.save(function (err, user) {
              if(err) { console.log(err); res.send(null); }
              else {
                res.redirect('/group');
              }
            });            
          }
        });
      }
    });
});

// Post request to send invitation to user.
//  params
//    hash: Group.ObjectId.hashed
//  body
//    username: String
router.post('/:hash/invite',
  Group.ensureExistsByHash(true), // Attaches group.
  User.ensureExistsByUsername(true, ['body', 'username']), // Attaches target.
  userInGroup('user', true, 'admins'),
  userInGroup('target', false, 'members'),
  userInGroup('target', false, 'requested'),
  function(req,res, next) {
    var group = req.attach.group;
    var target = req.attach.target;

    target.requests.push(group._id);
    //group.requested.push(target._id);
    group.members.push({ _id: target._id }); // Temporary.

    group.save(function(err) {
      if (err) { console.log(err); }
      else {
        target.save(function(err) {
          if (err) { console.log(err); }
          else { // Success.
            res.send({ success: 'Request has been sent to ' + target.username + '.' })
          }
        });
      }
    });
  }
);
   
// Delete request to remove user in a group.
//  params
//    hash: Group.ObjectId.hashed
//    username: String
router.delete('/:hash/member/:username',
  Group.ensureExistsByHash(true), // Attaches group.
  User.ensureExistsByUsername(true, ['params', 'username']), // Attaches target.
  userInGroup('target', true, 'members'),
  userInGroup('user', true, 'admins'),
  function(req, res, next) {
    var group = req.attach.group;
    var target = req.attach.target;

    group.members.pull({ _id: target._id });
    target.groups.pull(group._id);

    group.save(function(err) {
      if (err) { console.log(err); }
      else {
        target.save(function(err) {
          if (err) { console.log(err); }
          else { // Success.
            res.send({ success: 'User ' + target.username + ' is removed from the group.' })
          }
        });
      }
    });
});
   
// Put request to remove user in a group.
//  params
//    hash: Group.ObjectId.hashed
//    username: String
router.put('/:hash/member/:username/color',
  Group.ensureExistsByHash(true), // Attaches group.
  User.ensureExistsByUsername(true, ['params', 'username']), // Attaches target.
  userInGroup('target', true, 'members'),
  userInGroup('user', true, 'admins'),
  function(req, res, next) {
    var group = req.attach.group;
    var target = req.attach.target;

    group.members.forEach(function(member, index, members) {
      if (member._id.toString() === target._id.toString()) {
        group.members[index].color = req.body.color;
      }
    });

    group.save(function(err) {
      if (err) { console.log(err); }
      else {
        res.send({ success: 'Member ' + target.username + ' changed colors.' })
      }
    });
});

// POST request to leave group.
router.post('/:hash/leave',
  Group.ensureExistsByHash(true),
  userInGroup('user', true, 'members'),
  userInGroup('user', false, 'admins'), // Administrators cannot leave group at the moment.
  function(req, res, next) {
    var group = req.attach.group;
    var user = req.attach.user;

    group.members.forEach(function(member, index, members) {
      if (member._id.toString() === user._id.toString()) {
        group.members.pull(member);
      }
    });

    group.save(function(err) {
      if (err) { return next(err); }
      return res.redirect('/group');
    })
  }
);

// DELETE request to evict member.
router.post('/:hash/member/:username',
  Group.ensureExistsByHash(true),
  User.ensureExistsByUsername(true, ['params', 'username']),
  userInGroup('target', true, 'members'),
  userInGroup('target', false, 'admins'), // Cannot evict admins at the moment.
  userInGroup('user', true, 'admins'),
  function(req, res, next) {
    var group = req.attach.group;
    var target = req.attach.target;

    group.members.forEach(function(member, index, members) {
      if (member._id.toString() === target._id.toString()) {
        group.members.pull(member);
      }
    });

    group.save(function(err) {
      if (err) { return next(err); }
      return res.send({ success: 'yay kicked him' });
    })
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

// Get request for list of groups of logged in user.
router.get('/', function(req, res, next) {
  User
  .findOne({ username: req.user.username })
  .populate('groups', 'groupName')
  .exec(function(err, user) {
    if (err) { console.log(err); }
    else if (user) {
      var hashids = req.app.settings.hashids;
      user.groups.forEach(function(group) {
        var friendly_url;
        friendly_url = group.groupName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
        group.url = '/calendar/group/' + group.getHash() + '/' + friendly_url;
      });
      res.render('groups', { groups: user.groups });
    }
  })
});

module.exports = router;