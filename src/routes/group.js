var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Schema = mongoose.Schema;
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');

//***************Middleware*******************************//

//Check logged in, else direct to login page
//Attach: myself - user info
function loggedIn(req, res, next) {
  if (req.user) { 
    req.attach.myself = req.user;
    next();  
  }
  else { 
    res.redirect('/login'); 
    res.send({error: "Please log in"});
  }
}

//Check for user existance
//Attach: user - user info
function searchUser(req, res, next) {
  User.findOne({username: req.body.username}, function (err, user) {
    if (err) { console.log(err); res.send(null); }
    else if (user) {
      req.attach.user = user;
      next();
    }
    else {
      res.send({ error: 'User does not exist.' });
    }
  });
}

//Check for group existance
//Attach: group - group info
function searchGroup(positive) {
  return function (req, res, next) {
    Group.findOne({groupName: req.body.groupName}, function (err,group) {
      if(err) { console.log(err); res.send(null); }
      else if(positive){ // We want the group to exist...
        if (group) { // ...it exists!
          req.attach.group = group;
          next();
        }
        else res.send({error:"Group not found in database"}); // ...but it doesn't.
      }
      else { // We don't want the group to exist...
        if(group) res.send({error:"Same group name exist."}); // ...but it does.
        else { // ...and it doesn't!
          req.attach.group = group;
          next();
        }
      }
    });
  };
}

//TRUE - Check for group existance and request existance
//attach: group - group info
//        requested - request's username and id
//FALSE - Check for group existance and request absence
//attach: group - group info
function searchGroupAndRequest(positive) {
  return function (req, res, next) {
    var sent = false;
    var group = req.attach.group;
    var requested = req.attach.user;
    if (group && requested) { // Compulsory to have.
      var hasUser = group.hasUser(requested, 'requested'); // Search in .requested.
      if (positive) { // We want user in group...
        if (hasUser) { next(); } // ...yay!
        else { // ...nope, user is not in group.
          res.send({ error: requested.username + ' is not invited to join group ' + group.groupName + '.' });
        }
      }
      else { // We don't want user in group...
        if (hasUser) { // ...nope, user is in group.
          res.send({ error: requested.username + ' is already invited to join group ' + group.groupName + '.' });
        }
        else { next(); } // ...yay!
      }
    }
  }
};

//Check for group admin existance
//attach: admin - admin info
function isAdmin(req, res, next) {
  var sent = false;
  Group.findOne({groupName:req.body.groupName})
  .populate("admins","username")
  .exec(function (err,group) {
    group.admins.forEach(function (admin, index) {
      if(admin.username == req.user.username && !sent) {
        req.attach.admin = admin;
        next();
        sent = true;
      }
      else if(index >= group.admins.length-1 && !sent) {
        sent = true;
        res.send({error:"You are not authorized to"
                    +" modify the group."});
      }
    });
  })
}

//TRUE - check for user in group existance
//attach - group: group info
//         member: member info
//FALSE - check for user in group absence
//attach - group: group info
//IF group not exist, 
function searchUserInGroup(positive) {
  return function (req, res, next) {
    var sent = false;
    var group = req.attach.group;
    var requested = req.attach.user;
    if (group && requested) { // Compulsory to have.
      var hasUser = group.hasUser(requested);
      if (positive) { // We want user in group...
        if (hasUser) { next(); } // ...yay!
        else { // ...nope, user is not in group.
          res.send({ error: requested.username + ' is not in the group ' + group.groupName + '.' });
        }
      }
      else { // We don't want user in group...
        if (hasUser) { // ...nope, user is in group.
          res.send({ error: requested.username + ' is already in group ' + group.groupName + '.' });
        }
        else { next(); } // ...yay!
      }
    }
  }
}
//*****************POST REQUEST*************************************//
//Post request to create new Group
router.post('/createGroup', loggedIn, 
  searchGroup(false), function (req, res) {
    User.findOne({username:req.user.username}).
    exec(function (err, user) {
      Group.create({
        groupName: req.body.group_name,
        members: [user._id],
        admins: [user._id],
        requested: []
      }, function (err, group) {
        if(err) { console.log(err); res.send(null); }
        else {
          user.groups.push(group._id);
          user.save(function (err, user) {
            if(err) { console.log(err); res.send(null); }
            else { 
              // res.send({success:"New group '"+
              //   req.body.groupName+"' is created."});
              res.redirect('/group');
            }
          });
        }
      });
    });
});

//Post request to send invitation to person
router.post('/sendRequest', loggedIn, searchGroup(true), isAdmin, searchUser, 
  searchUserInGroup(false), searchGroupAndRequest(false), 
  function (req,res) {
    var requested = req.attach.user;
    var group = req.attach.group;
    requested.requests.push(group._id);
    group.requested.push(requested._id);
    requested.save(function(err) {
      if (err) { console.log(err); }
      else {
        group.save(function(err) {
          if (err) { console.log(err); }
          else { // Successfully added request.
            res.send({ success: 'Request has been sent to ' + requested.username + '.' });
          }
        })
      }
    });
  }
);

//Post request to accept request
router.post('/acceptInvitation', loggedIn, searchGroupAndRequest(true), 
  function (req, res) {
    Group.findOneAndUpdate({groupName: req.body.groupName},
      {$push:{members:req.attach.requested._id}, 
       $pull:{requested:req.attach.requested._id}},
      function (err, group) {
        if(err) { console.log(err); res.send(null); }
        User.findOneAndUpdate({username:req.user.username},
          {$push:{groups:group._id}, $pull:{requests:group._id}}, 
          function (err, user) {
            if(err) { console.log(err); res.send(null); }
            res.send({sucess:"User "+req.user.username+
                    " added into group "+req.body.groupName});
        }); 
    }); 
});

//Post request to reject invitation
router.post('/rejectInvitation', loggedIn, searchGroupAndRequest(true), 
  function (req, res) {
    Group.findOneAndUpdate({groupName: req.body.groupName},
      {$pull:{requested:req.attach.requested._id}},
      function (err, group) {
        if(err) { console.log(err); res.send(null); }
        User.findOneAndUpdate({username:req.user.username},
          {$pull:{requests:group._id}}, function (err, user) {
            if(err) { console.log(err); res.send(null); }
            res.send({sucess:"User "+req.user.username+
                    " has rejected the invitation into group "+req.body.groupName});
        }); 
    }); 
});
   
//Post request to remove person to a group
router.post('/removeMember', loggedIn, searchGroup(true), 
  searchUserInGroup(true), function (req,res) {
    var sent = false;
    Group.findOneAndUpdate({groupName:req.body.groupName},
      {$pull:{members:req.attach.member._id}}, 
      function (err, group) {
        if(err) { console.log(err); res.send(null); }
        User.findOneAndUpdate({username:req.body.user},
        {$pull:{groups:group._id}}, function (err, user) {
          if(err) { console.log(err); res.send(null); }
          if(group.members.length == 0 && !sent) {
            sent = true;
            group.remove(function (err, deleted) {
              console.log("deleted");
              res.send({success:"User "+req.body.user+
                    " is removed from group, group deleted."});
            });
          }
          else if(!sent) {
            res.send({success:"User "+req.body.user+
                    " is removed from group."});
          }
        });
    });
});

router.get('/calendar', function(req, res) {
  var userEvents = [];
  Group
  .findOne({ groupName: req.query.groupName })
  .populate('members', 'username events')
  .exec(function(err, group) {
    if (err) { console.log(err); }
    else if (group) {
      group.members.forEach(function (member, index) {
        userEvents.push({
          username: member.username,
          events: member.events
        });

        if (index >= group.members.length - 1) {
          res.send(userEvents);
        }
      });
    };
  });
});

router.get('/', loggedIn, function(req, res) {
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