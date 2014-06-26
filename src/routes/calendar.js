var express = require('express');
var router = express.Router();

router.get('/group/:name', function(req, res) {
  // Maybe we should use id or generate a unique id like YouTube.
  //   Then append their name at the end, e.g.
  //   .../group/aBcDeFgI123/TheGroupName
  //   even though the group name is just for show.
  var groupName = req.params.name;
  res.render('calendar');
});

router.get('/', function(req, res) {
  if (req.user) {
    res.render('calendar');
  }
  else {
    req.flash('error', 'Please log in.');
    res.redirect('/login');
  }
});

module.exports = router;