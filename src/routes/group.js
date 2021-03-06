var express = require('express');
var router = express.Router();
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');
var Calendar = require('../schema/calendarSchema');
var Request = require('../schema/requestSchema');
var groupAdmin = require('./groupAdmin');
var UserError = require('../userError.js');

router.use(User.ensureAuthenticated());

// Deals with hash.
router.param('hash', Group.ensureExistsByHash());
router.all('/:hash', function(req, res, next) {
  res.error.redirect = '/group/' + req.params.hash;
  next();
});

router.use('/:hash/admin', groupAdmin);

// Post request to create new Group.
//  body
//    group_name: String
router.post('/', 
  function(req, res, next) {
    res.error.redirect = '/group';
    var user = req.attach.user;
    Group.create({
      groupName: req.body.group_name,
      members: [{ _id: user._id, role: Group.roles.OWNER }],
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

// Post request to send invitation to user.
//  params
//    hash: Group.ObjectId.hashed
//  body
//    username: String
router.post('/:hash/invite',
  User.ensureExistsByUsername(true, ['body', 'username'], 'There is no such user.'), // Attaches target.
  Group.userIsType('user', true, Group.roles.ADMIN, 'Only admins can invite other users.'),
  Group.userIsType('target', false, Group.roles.MEMBER, 'User is already in the group.'),
  Group.userIsType('target', false, Group.roles.REQUESTED, 'User is already invited to the group.'),
  function(req, res, next) {
    var group = req.attach.group;
    var target = req.attach.target;

    group.members.push({
      _id: target._id,
      role: Group.roles.REQUESTED
    });
    target.requests.push({
      type: Request.types.GROUP,
      requester: req.attach.user,
      subject_id: group._id,
      description: req.attach.user.display_name + ' invited you to join the group ' + group.groupName + '.',
    });

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

// Post request to accept invitation.
//  params
//    hash: Group.ObjectId.hashed
//  body
//    username: String
router.post('/:hash/accept',
  Group.userIsType('user', false, Group.roles.MEMBER, 'You are already in the group.'),
  Group.userIsType('user', true, Group.roles.REQUESTED, 'You have not been invited to the group.'),
  function(req, res, next) {
    var group = req.attach.group;
    var user = req.attach.user;

    var member = group.switchRoleById(user._id, Group.roles.MEMBER);

    var requestIndex;
    user.requests.forEach(function(request, index) {
      if (request.subject_id === group._id) { requestIndex = index; }
    });
    user.requests.splice(requestIndex, 1);
    user.groups.push(group._id);

    group.save(function(err) {
      if (err) { return next(err); }
      else {
        user.save(function(err) {
          if (err) { return next(err); }
          else { // Success.
            res.send({
              success: 'You have joined the group.',
              data: {
                groupName: group.groupName,
                groupUrl: group.getUrl(),
                groupHash: group.getHash(),
              }
            })
          }
        });
      }
    });
  }
);

// Post request to reject invitation.
//  params
//    hash: Group.ObjectId.hashed
//  body
//    username: String
router.post('/:hash/reject',
  Group.userIsType('user', false, Group.roles.MEMBER, 'You are already in the group.'),
  Group.userIsType('user', true, Group.roles.REQUESTED, 'You have not been invited to the group.'),
  function(req, res, next) {
    var group = req.attach.group;
    var user = req.attach.user;

    var removedMember = group.removeMemberById(user._id);

    var requestIndex;
    user.requests.forEach(function(request, index) {
      if (request.subject_id === group._id) { requestIndex = index; }
    });
    user.requests.splice(requestIndex, 1);

    group.save(function(err) {
      if (err) { return next(err); }
      else {
        user.save(function(err) {
          if (err) { return next(err); }
          else { // Success.
            res.send({ success: 'You have declined the invitation.' })
          }
        });
      }
    });
  }
);
   
// Put request to change color of a group member.
//  params
//    hash: Group.ObjectId.hashed
//    username: String
router.put('/:hash/member/:username/color',
  User.ensureExistsByUsername(true, ['params', 'username'], 'There is no such user.'), // Attaches target.
  Group.userIsType('target', true, Group.roles.MEMBER, 'User does not belong in the group.'),
  function(req, res, next) {
    var group = req.attach.group;
    var target = req.attach.target;
    
    group.changeColorById(target._id, req.body.color);
    group.save(function(err) {
      if (err) { return next(err); }
      else {
        return res.send({ success: 'Member ' + target.username + ' changed colors.' })
      }
    });
});

// Post request to leave group.
router.post('/:hash/leave',
  Group.userIsType('user', false, Group.roles.OWNER, 'Owners cannot leave the group.'), // Administrators cannot leave group at the moment.
  Group.userIsType('user', true, Group.roles.MEMBER, 'You are not a member of the group.'),
  function(req, res, next) {
    var group = req.attach.group;
    var user = req.attach.user;

    var removedMember = group.removeMemberById(user._id);

    user.groups.pull(group._id);

    group.save(function(err) {
      if (err) { return next(err); }
      user.save(function(err) {
        if (err) { return next(err); }
        return res.redirect('/group');
      })
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
      return res.render('groups', { groups: user.groups });
    }
  })
});

module.exports = router;
