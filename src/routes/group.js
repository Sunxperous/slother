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
// var User = mongoose.model('user',userSchema);

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
  var member = [];
  member.push({name: req.user.username,
                events: req.user.events});
  var check = searchGroup(req.query.groupName);
  console.log("check " +check);
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
  Group.findOneAndUpdate({groupName: req.body.groupName},
    {$push:{member: User.findOne({username: req.body.member}, 
        function(err,user) {
          return {name: user.username,
                    events: user.events};
      })}}, 
      function (err) {
        if(err) {console.log("err '"+err+"'.")}
        else
          console.log("Updated " + req.body.member);
      }
  );
});


module.exports = router;