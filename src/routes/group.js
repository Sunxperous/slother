var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Schema = mongoose.Schema;
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');

//Return boolean of user existance in db by callback
function searchUser(username, callback) {
  User.findOne({username: username}, function (err, user) {
    if(user !== null) return callback(null,true);
    else return callback(null,false);
  });
}

//Return boolean of user existance of a group in db by callback
//Note: if group does not exist, function will return false
function searchUserInGroup(username, groupName, callback) {
  
  Group.findOne({groupName: groupName, member:{$in:[username]}},
    function (err,userInGroup) {
      if(userInGroup !== null) return callback(null,true);
      else return callback(null,false);
  });
}

//Return boolean of group existance in db by callback
function searchGroup(groupName, callback) {
  Group.findOne({groupName: groupName}, function (err,group) {
    if(group !== null) return callback(null,true);
    else return callback(null,false);
  });
}

//Post request to create new Group
router.post('/createGroup', function (req,res) {
  searchGroup (req.body.groupName, function (dummy, found) {
    if(found) {
      res.send("Group name already exist.");
    }
    else {
      var member = [];
      member.push(req.user.username);
      var temp = {
        groupName: req.body.groupName,
        member: member,
        admin: req.user.username
      };
      Group.create(temp);
      User.findOneAndUpdate({username:req.user.username},
        {$push:{group:req.body.groupName}}, function (err,user) {
          res.send("Group created");
        });
    }
  });
});

router.post('/joinGroup', function (req, res) {
  searchUserInGroup(req.user.username ,req.body.group, function (err,found) {
    if(found) {
      res.send("User is in the group already.");
    }
    else{
      Group.findOneAndUpdate({groupName: req.body.group}, 
        {$push:{member:req.user.username},
         $pull:{requested:req.user.username}
        }, 
        function (err, group) {
          if(err) 
            res.send("Error '"+err+"'."); 
          else {
            User.findOneAndUpdate({username:req.user.username},
              {$push:{group:req.body.group},
               $pull:{request:req.body.group}
              }, function (err,user) {
                res.send("User "+req.user.username+
                  " added into group "+req.body.group);
            });
          }
      });
    }
  });
});

//Post request to add person to a group
router.post('/sendRequest', function (req,res) {
  searchGroup(req.body.group, function (err,foundGroup){
    if(foundGroup) {
      searchUserInGroup(req.body.user,req.body.group, function (err, foundUserInGroup) {
        if(foundUserInGroup)
          res.send(req.body.user+" is in the group.");
        else {
          searchUser(req.body.user, function (err, foundUser) {
            if(foundUser) {
              Group.findOneAndUpdate({groupName: req.body.group}, 
                {$push:{requested:req.body.user}}, 
                function (err, group) {
                  if(err) 
                    res.send("Error '"+err+"'."); 
                  else {
                    User.findOneAndUpdate({username:req.body.user},
                      {$push:{request:req.body.group}},
                      function (err,user) {
                        res.send("Request has been sent to "+req.body.user);
                    });
                  }
              });
            }
            else
              res.send("User "+req.body.user+" does not exist in the system.");
          });
        }
      });
    }
    else
      res.send("Group not found. Please create the group first.");  
  });
});

//Post request to remove person to a group
router.post('/removeMember', function (req,res) {
  searchGroup(req.body.group, function (err,foundGroup) {
    if(foundGroup) {
      searchUserInGroup(req.body.user,req.body.group, function (err, foundUserInGroup) {
        if(foundUserInGroup) {
          Group.update({groupName: req.body.group,},
            {$pull:{member:req.body.user}},
            function (err2) {
              if(err2)
                console.log("err "+err);
              else {
                User.findOneAndUpdate({username: req.body.user},
                  {$pull:{group:{$in:[req.body.group]}}}, function (err,user) {
                    res.send("Member "+req.body.user+" is removed from the group");
                  });
              }
           });
        }
        else {
          res.send(req.body.user+" is not in the group.");
        }
      });
    }
    else
      res.send("Group not found. Operation aborted."); 
  });
});

router.get('/calendar', function(req, res) {
  var userEvents = [];
  Group.findOne({ groupName: req.query.groupName }, function(err, group) {
    if (err) { console.log(err); }
    else if (group) {
      group.member.forEach(function(username, index) {
        User.findOne({ username: username }, function(errUser, user) {
          userEvents.push({
            username: user.username,
            events: user.events
          });

          if (index >= group.member.length - 1) {
            res.send(userEvents);
          }
        });
      });
    }
  });
});

module.exports = router;