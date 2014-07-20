var express = require('express');
var router = express.Router();
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');
var Calendar = require('../schema/calendarSchema');
var UserError = require('../userError.js');

router.use(User.ensureAuthenticated());

// Searches given _user in group[type], depending on positive.
function userInGroup(_user, positive, type, message) {
  return function(req, res, next) {
    var group = req.attach.group;
    var user = req.attach[_user];
    if (group && user) { // Compulsory to have.
      var hasUser = group.hasUser(user, type) && user.hasGroup(group);
      if (positive) { // We want user in group list...
        if (hasUser) { return next(); } // ...yay!
        else { // ...nope, user is not in group list.
          return next(new UserError(message));
        }
      }
      else { // We don't want user in group list...
        if (hasUser) { // ...nope, user is in group list.
          return next(new UserError(message));
        }
        else { return next(); } // ...yay!
      }
    }
  }
}

// Post request to create new Group.
//  body
//    group_name: String
router.post('/', 
  function(req, res, next) {
    res.error.redirect = '/group';
    var user = req.attach.user;
    Group.create({
      groupName: req.body.group_name,
      members: [{ _id: user._id }],
      admins: [user._id],
      requested: [],
      created_by: user._id
    }, function(err, group) {
      if (err) { return next(err); }
      if (group) {
        Calendar.create({
          name: group.groupName, group: group._id
        }, function(err, calendar) {
          if (err) { return next(err); }
          if (calendar) {
            user.groups.push(group._id);
            user.save(function (err, user) {
              if (err) { return next(err); }
              return res.redirect('/group');
            });            
          }
        });
      }
    });
});

router.all('/:hash', function(req, res, next) {
  res.error.redirect = '/group/' + req.params.hash;
  next();
});

// Post request to send invitation to user.
//  params
//    hash: Group.ObjectId.hashed
//  body
//    username: String
router.post('/:hash/invite',
  Group.ensureExistsByHash(true, 'There is no such group.'), // Attaches group.
  User.ensureExistsByUsername(true, ['body', 'username'], 'There is no such user.'), // Attaches target.
  userInGroup('user', true, 'admins', 'Only admins can invite other users.'),
  userInGroup('target', false, 'members', 'User is already in the group.'),
  userInGroup('target', false, 'requested', 'User is already invited to the group.'),
  function(req,res, next) {
    var group = req.attach.group;
    var target = req.attach.target;

    target.requests.push(group._id);
    //group.requested.push(target._id);
    group.members.push({ _id: target._id }); // Temporary.

    group.save(function(err) {
      if (err) { return next(err); }
      else {
        target.save(function(err) {
          if (err) { return next(err); }
          else { // Success.
            return res.send({ success: 'Request has been sent to ' + target.username + '.' })
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
  Group.ensureExistsByHash(true, 'There is no such group.'), // Attaches group.
  User.ensureExistsByUsername(true, ['params', 'username'], 'There is no such user.'), // Attaches target.
  userInGroup('target', true, 'members', 'User does not belong to the group.'),
  userInGroup('user', true, 'admins', 'Admins cannot be removed from the group.'),
  function(req, res, next) {
    var group = req.attach.group;
    var target = req.attach.target;

    group.members.pull({ _id: target._id });
    target.groups.pull(group._id);

    group.save(function(err) {
      if (err) { return next(err); }
      else {
        target.save(function(err) {
          if (err) { return next(err); }
          else { // Success.
            return res.send({ success: 'User ' + target.username + ' is removed from the group.' })
          }
        });
      }
    });
});
   
// Put request to change color of a group member.
//  params
//    hash: Group.ObjectId.hashed
//    username: String
router.put('/:hash/member/:username/color',
  Group.ensureExistsByHash(true, 'There is no such group.'), // Attaches group.
  User.ensureExistsByUsername(true, ['params', 'username'], 'There is no such user.'), // Attaches target.
  userInGroup('target', true, 'members', 'User does not belong in the group.'),
  function(req, res, next) {
    var group = req.attach.group;
    var target = req.attach.target;

    group.members.forEach(function(member, index, members) {
      if (member._id.toString() === target._id.toString()) {
        group.members[index].color = req.body.color;
      }
    });

    group.save(function(err) {
      if (err) { return next(err); }
      else {
        return res.send({ success: 'Member ' + target.username + ' changed colors.' })
      }
    });
});

// Post request to leave group.
router.post('/:hash/leave',
  Group.ensureExistsByHash(true, 'There is no such group.'),
  userInGroup('user', true, 'members', 'You are not a member of the group.'),
  userInGroup('user', false, 'admins', 'Admins cannot leave the group.'), // Administrators cannot leave group at the moment.
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

// Get request for list of groups of logged in user.
router.get('/', function(req, res, next) {
  User
  .findOne({ username: req.user.username })
  .populate('groups', 'groupName')
  .exec(function(err, user) {
    if (err) { return next(err); }
    else if (user) {
      var hashids = req.app.settings.hashids;
      user.groups.forEach(function(group) {
        var friendly_url;
        friendly_url = group.groupName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
        group.url = '/calendar/group/' + group.getHash() + '/' + friendly_url;
      });
      return res.render('groups', { groups: user.groups });
    }
  })
});

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

module.exports = router;