var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Schema = mongoose.Schema;
var groupSchema = new Schema({
  groupName: String,
  member: Array,
});

// var User = require('./extractMod.js');
// var userSchema = mongoose.Schema({
//   username: String,
//   events: Array
// });
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
router.get('/createGroup', function (req,res) {
  //console.log("COme into create group");
  console.log(req.user.events);
  var member = [];
  member.push({name: req.user.username,
                events: req.user.events});
  //var check = searchGroup(req.query.groupName);
  //console.log("check " +check);
  Group.findOne({groupName: req.query.groupName}, function(err,group) {
    //console.log("group "+group);
    if(group !== null) {
      console.log("Group name already exist.");
      res.send(null);
    }
    else {
      var temp = {
        groupName: req.query.groupName,
        member: member
      }
      Group.create(temp);
      res.send(temp);
    }
  }); 
});

//Post request to add person to a group
router.get('/addPerson',function (req,res) {
  User.findOne({username: req.query.user}, 
    function(err,user) {
      Group.findOneAndUpdate({groupName: req.query.group}, 
        {$push:{member: {name: user.username,
          events: user.events
        }}}, function (err, group) {
          if(!err) console.log("User "+user.username+" added into group"+req.query.group);
          else console.log("err '"+err+"'.");
          res.send(group);
      });
  });
});


module.exports = router;