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
  User.findOne({username: req.body.user}, function (err, user) {
    if(err) { console.log(err); res.send(null); }
    else if(user !== null) {
      req.attach.user = user;
      next();
    }
    else res.send({error:"User not found in database"});
  });
}

//Check for group existance
//Attach: group - group info
function searchGroup(positive) {
  return function (req, res, next) {
    Group.findOne({groupName: req.body.groupName}, function (err,group) {
      if(err) { console.log(err); res.send(null); }
      else if(positive){
        if(group !== null) {
          req.attach.group = group;
          next();
        }
        else res.send({error:"Group not found in database"}); 
      }
      else {
        if(group !== null) res.send({error:"Same group name exist."});
        else next();
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
    Group.findOne({groupName:req.body.groupName})
    .populate("requested","username _id")
    .exec( function (err, group) {
      if(err) { console.log(err); res.send(null); }
      req.attach.group = group;
      if (group == null) 
        res.send({error:"Group does not exist."});
      else {
        group.requested.forEach(function (request) {
          if(request.username == req.user.username && positive) {
            req.attach.requested = request;
            sent = true;
            next();
          }
          else if(request.username == req.body.user && !positive) {
            sent = true;
            res.send({error:"Request has been sent previously."});
          }
          else if(request.username == req.body.user && positive) {
            req.attach.requested = request;
            sent = true;
            next();
          }
        });
        if(positive && !sent)
          res.send({error:"Group request has not been sent to you."});
        else if(!positive && !sent) {
          next();
        }
      }
    });
  }
}

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
    Group.findOne({groupName: req.body.groupName})
    .populate('members',"username _id")
    .exec(function (err, group) {
      if(err) { console.log(err); res.send(null); }
      else if(group == null) {
         sent = true;
         res.send({error:"Group not found in database."});
      }
      else {
        req.attach.group = group;
        group.members.forEach(function (member) {
          if(member.username == req.body.user) {
            if(positive) {
              req.attach.member = member;
              sent = true;
              next();
            }
            else {
              sent = true;
              res.send({error:"User is already in the group."});
            }
          }
        });
        if(positive && !sent) {
          console.log(req.body)
          sent = true;
          res.send({error:"User "+req.body.user+
                      " is not in the group."});
        }
        else if(!positive && !sent) 
          next();
      }
    });
  }
}
//*****************POST REQUEST*************************************//
//Post request to create new Group
router.post('/createGroup', loggedIn, 
  searchGroup(false), function (req, res) {
    User.findOne({username:req.user.username}).
    exec(function (err, user) {
      Group.create({
        groupName: req.body.groupName,
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
              res.send({success:"New group '"+
                req.body.groupName+"' is created."});
            }
          });
        }
      });
    });
});

//Post request to send invitation to person
router.post('/sendRequest', loggedIn, isAdmin, searchUser, 
  searchUserInGroup(false), searchGroupAndRequest(false), 
  function (req,res) {
    console.log("reach the end")
    User.findOne({username:req.body.user})
    .exec(function (err,user) {
      if(err) { console.log(err); res.send(null); }
        Group.findOneAndUpdate({groupName:req.body.groupName},
          {$push:{requested:user._id}}, function (err, group) {
            if(err) { console.log(err); res.send(null); }
              user.requests.push(group._id);
              user.save(function(err) {
                if(err) { console.log(err); res.send(null); }
                res.send({success:"Request has been sent to "
                          +req.body.user});   
              });       
        });
    });
});

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

module.exports = router;