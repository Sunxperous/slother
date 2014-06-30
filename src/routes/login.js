var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
//var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var OpenIDStrategy = require('passport-openid').Strategy;
var router = express.Router();
var config = require('../config');
var bcrypt = require('bcrypt-nodejs');
var User = require('../schema/userSchema');

function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    req.flash('alert', 'You are already logged in.');
    res.redirect('/calendar');
  }
  else { next(); }
}

// Login page.
router.get('/login', redirectIfAuthenticated,
  function(req, res) {
    res.render('login');
  }
);


// http://passportjs.org/guide/username-password/
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Invalid login.' });
      }
      else {
        user.authPassword(password, function(res) {
          if (!res) {
            return done(null, false, { message: 'Invalid login.' });
          }
          else {
            return done(null, user);
          }
        });
      }
    });
  }
));

// Default login request.
router.post('/login/default',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);


// http://passportjs.org/guide/openid/
// login via NUS only via localhost:8000,
// then continue development on original port.
passport.use('nus', new OpenIDStrategy({
    returnURL: config.nus.openId + '/login/nus/callback',
    realm: config.nus.openId,
    profile: true
  },
  function(identifier, profile, done) { // Only calls this function if successfully, I assume.
    console.log(profile);
    var nusId = identifier.slice(26, identifier.length); // Slice identifier: https://openid.nus.edu.sg/[.........] for nusId.
    User.findOne({ nusId: nusId }, function(err, user) {
      if (err) { return done(err); }
      if (!user) { // No such nusId found...
        User.create({ username: nusId, nusId: nusId }, function(err, user) { // Make new user.
          return done(null, user);
        })
      }
      if (user) { // nusId found.
        return done(null, user);
      }
    });
  }
));

// NUS login.
router.get('/login/nus', redirectIfAuthenticated,
  function(req, res) {
    passport.authenticate('nus');
  }
);
router.get('/login/nus/callback', passport.authenticate('nus', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);


// Default registration.
router.get('/register', redirectIfAuthenticated,
  function(req, res) {
    res.render('register');
  }
);

router.post('/register', function(req, res) {
  // Assuming valid, non-existing user...
  bcrypt.hash(req.body.password, null, null, function(err, hash) {
    User.create({
      username: req.body.username,
      password: hash
    }, function(err, user) {
      if (err) { res.redirect('/register'); }
      if (user) {
        req.login(user, function(err_login) {
          if (err) { res.redirect('/register'); }        
          return res.redirect('/');
        });
      }
    });  
  });  
});


// Logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;