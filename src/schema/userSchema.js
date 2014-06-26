// var express = require('express');
// var passport = require('passport');
var mongoose = require('mongoose');
// var LocalStrategy = require('passport-local').Strategy;
// //var OAuthStrategy = require('passport-oauth').OAuthStrategy;
// var OpenIDStrategy = require('passport-openid').Strategy;
// var router = express.Router();
// var config = require('../config');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  nusId: String,
  events: Array,
  group: Array
});

userSchema.methods.authPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, res) {
    callback(res);
  });
  // Apparently disallows empty passwords (if they registered via openID).
};

module.exports = mongoose.model('user',userSchema);