var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Schema = mongoose.Schema;
var groupSchema = new Schema({
  groupName: String,
  member: Array,
});

var userSchema = require('mongoose').model('user');
var User = mongoose.model('user',userSchema);

var Group = mongoose.model('group',groupSchema);

function searchGroup(groupName) {
  //Option 1
  // Group.findOne({groupName: groupName}).exec(function (err, group) {
  //   if(err) {
  //     console.log("err is "+err);
  //     return err;
  //   }
  //   else{
  //     console.log(group);
  //     if(group.groupName == groupName) {
  //       return true;

  //     }
  //     else 
  //       return false;
  //   }
  // })

  //End

  //Option 2
  Group.findOne({groupName: groupName}, function(err,group) {
    console.log("group "+group);
    if(group !== null) return true;
    else return false;
  });
}

function updatePerson() {};
function removePerson() {};
function generateFreeslot() {};

//Post request to create new Group
router.post('/createGroup', function (req,res) {
  var member = [];
  member.push({name: req.user.username,
                events: req.user.events});
  //var check = searchGroup(req.query.groupName);
  //console.log("check " +check);
  Group.findOne({groupName: req.body.groupName}, function(err,group) {
    if(group !== null) {
      console.log("Group name already exist.");
      res.send(null);
    }
    else {
      var temp = {
        groupName: req.body.groupName,
        member: member
      }
      Group.create(temp);
      res.send(temp);
    }
  }); 
});

//Post request to add person to a group
router.post('/addPerson',function (req,res) {
  User.findOne({username: req.body.user}, 
    function(userErr,user) {
      if(userErr) res.send("err '"+userErr+"'.");
      else if(user == null) {
        res.send("User does not exist.");
      }
      else {
        Group.findOneAndUpdate({groupName: req.body.group}, 
          {$push:{member: {name: user.username,
            events: user.events
          }}}, function (err, group) {
            if(err) {
              res.send("Error '"+err+"'.");
            }
            else if(group == null) {
              res.send("Group not found.");
            } 
            else {
              console.log("User "+user.username+
                " added into group "+req.body.group);
              res.send(group);
            }
        }); 
      }
  });
});

//Post request to remove person to a group
router.post('/removePerson', function (req,res) {
  Group.findOne({groupName: req.body.group}, function (err, found) {
    if(err) {
      res.send(err);
    }
    else if(found == null) {
      res.send("Group is not in the list.");
    }
    else {
      Group.update({groupName: req.body.group,},
        {$pull:{member:{name: req.body.user}}},
          function (err2) {
            res.send(200,"Member removed");
          });
    }
  });
   
});

module.exports = router;