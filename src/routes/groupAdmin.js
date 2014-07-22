var express = require('express');
var router = express.Router();
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');
var Calendar = require('../schema/calendarSchema');
var async = require('async');
var UserError = require('../userError.js');

router.use(function isAdminInGroup(req, res, next) { // req.attach.user and req.attach.group exists.
  var isAdmin = req.attach.group.admins.indexOf(req.attach.user._id);
  if (isAdmin !== -1) {
    return next();
  }
  res.error.redirect = req.attach.group.getUrl();
  return next(new UserError('You are not authorized to administrate this group'));
})

router.get('/', function(req, res, next) {
  var group = req.attach.group;
  var members = [];
  async.each(group.members, function(member, callback) {
    User.findById(member._id, function(err, user) {
      if (err) { return callback(err); }
      members.push({
        username: user.username,
        display_name: user.display_name,
        isAdmin: group.hasUser(user, 'admins'),
      });
      callback();
    });
  }, function(err) {
    if (err) { return next(err); }
    return res.render('groupAdmin', { group: group, members: members });
  });
});
   
// Delete request to remove user in a group.
//  params
//    hash: Group.ObjectId.hashed
//    username: String
router.delete('/member/:username',
  User.ensureExistsByUsername(true, ['params', 'username'], 'There is no such user.'), // Attaches target.
  Group.userInGroup('target', true, 'members', 'User does not belong to the group.'),
  Group.userInGroup('user', true, 'admins', 'Admins cannot be removed from the group.'),
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
            //return res.send({ success: 'User ' + target.username + ' is removed from the group.' })
            return res.redirect('/group/' + group.getHash() + '/admin');
          }
        });
      }
    });
});

module.exports = router;