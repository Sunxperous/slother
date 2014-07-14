var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  if (req.user) {
    res.redirect('/calendar/user');
  }
  else {
    res.redirect('/login'); // For faster testing.
    //res.render('index', { title: 'Slother by Sloth'});
  }
});

module.exports = router;