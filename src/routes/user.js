var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var User = mongoose.model('user');

router.get('/calendar', function(req, res) {
  if (req.user) {
    User.findOne({username: req.user.username}, function(err, user) {
      if (err) {
        console.log(err);
      }
      if (user) {
        res.send(user.events);
      }
      else {
        res.send(null);
      }
    });
  }
  else {
    res.send(null);
  }
});

module.exports = router;