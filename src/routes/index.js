var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (req.attach.user) {
    return res.redirect('/calendar/user');
  }
  return res.render('index', { title: 'Slother by Sloth'});
});

router.get('/about', function(req, res, next) {
  return res.render('index', { title: 'About' });
});

module.exports = router;