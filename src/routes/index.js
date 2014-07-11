var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  if (req.user) {
    res.redirect('/calendar/user');
  }
  else {
    res.render('index', { title: 'Slother by Sloth'});
  }
});

module.exports = router;