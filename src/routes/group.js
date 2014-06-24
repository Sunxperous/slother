var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var Schema = mongoose.Schema;

var groupSchema = new Schema({
  groupName: String,
  member: Array,
});

var Group = mongoose.model('group',groupSchema);

function searchGroup(groupName) {
  Group.findOne({groupName: groupName}).exec(function (err, group) {
    if(err) {
      console.log("err is "+err);
      return true;
    }
    else
      console.log(group);
      return false;
  })
  // console.log(check);
  //   if(check !== undefined) return true;
  //   else return false;
}

function updatePerson() {};
function removePerson() {};
function generateFreeslot() {};

//Post request to create new Group
router.get('/', function (req,res) {
  //console.log("COme into create group");
  var member = [];
  member.push({name: req.user.username,
                events: req.user.events})
  if(searchGroup(req.query.groupName)){
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
  }},
    function(err) {
      if(err) {console.log("err '"+err+"'.")};
    } 
);

//Post request to add person to a group
// router.get('/addPerson',function (req,res) {
//   Group.findOneAndUpdate({groupName: req.body.groupName},
//     {$push:{member: User.findOne({username: req.body.member}, 
//         function(err,user) {
//           return {name: user.username,
//                     events: user.events};
//       })}}, 
//       function (err) {
//         if(err) {console.log("err '"+err+"'.")}
//         else
//           console.log("Updated " + req.body.member);
//       }
//   );
// });


module.exports = router;