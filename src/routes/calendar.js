var express = require('express');
var router = express.Router();

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