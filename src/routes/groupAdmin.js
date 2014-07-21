var express = require('express');
var router = express.Router();
var User = require('../schema/userSchema');
var Group = require('../schema/groupSchema');
var Calendar = require('../schema/calendarSchema');
var UserError = require('../userError.js');

router.use(function(req, res, next) { // req.attach.user and req.attach.group exists.
  var isAdmin = req.attach.group.admins.indexOf(req.attach.user._id);
  if (isAdmin !== -1) {
    return next();
  }
  res.error.redirect = req.attach.group.getUrl();
  return next(new UserError('You are not authorized to administrate this group'));
})

router.get('/', function(req, res, next) {
  res.send(req.attach);
});

module.exports = router;