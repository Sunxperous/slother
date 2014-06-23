var mongoose = require('mongoose');
var Group = require('./groupSchema.js');

function searchGroup(groupName) {
  Group.findOne({groupName: groupName}, function (req,res) {
    if(res) return true;
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
                events: req.user.events})
  if(searchGroup(req.body.groupName))
    console.log("Group name already exist.");
  else {
    Group.create({
      groupName: req.body.groupName,
      member: member
    }, function(err) {
      if(err) {console.log("err '"+err+"'.")};
    });
  }
});

//Post request to add person to a group
router.post('/addPerson',function (req,res) {
  Group.findOneAndUpdate({groupName: req.body.groupName},
    {$push:{member: User.findOne({username: req.body.member}, 
        function(err,user) {
          return {name: user.username,
                    events: user.events};
      })}, 
      function(err) {
        if(err) {console.log("err '"+err+"'.")};
        else
          console.log("Updated " + req.body.member);
      };
});


module.exports = router;