var express = require('express');
var router = express.Router();
var User = require('../schema/userSchema');

router.get('/group/:name', function(req, res) {
  // Maybe we should use id or generate a unique id like YouTube.
  //   Then append their name at the end, e.g.
  //   .../group/aBcDeFgI123/TheGroupName
  //   even though the group name is just for show.
  if (req.user) {
    var groupName = req.params.name;
    User
    .findOne({ username: req.user.username })
    .populate('groups')
    .exec(function(err, user) {
      res.render('calendar', {
        groups: user.groups,
        requests: user.requests
      });
    });
  }
  else {
    req.flash('error', 'Please log in.');
    res.redirect('/login');
  }
});

router.get('/', function(req, res) {
  if (req.user) {
    User
    .findOne({ username: req.user.username })
    .populate('groups')
    .populate('requests')
    .exec(function(err, user) {
      res.render('calendar', {
        groups: user.groups,
        requests: user.requests
      });
    });
  }
  else {
    req.flash('error', 'Please log in.');
    res.redirect('/login');
  }
});

module.exports = router;