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
var Token = require('../schema/tokenSchema');
  var randtoken = require('rand-token');
var UserError = require('../userError.js');

function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    req.flash('alert', 'You are already logged in.');
    res.redirect('/calendar');
  }
  else { next(); }
}

function redirectUnlessPending(req, res, next) {
  if (req.isAuthenticated() && req.attach.user.status === User.statusTypes.PENDING) {
    next();
  }
  else {
    return res.redirect('/login');
  }
}

// Login page.
router.get('/login', redirectIfAuthenticated,
  function(req, res, next) {
    res.render('login', req.flash('login')[0]);
  }
);


// http://passportjs.org/guide/username-password/
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Invalid username/password.' });
      }
      else {
        user.authPassword(password, function(res) {
          if (!res) {
            return done(null, false, { message: 'Invalid username/password.' });
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
  function(req, res, next) {
    res.error.redirect = '/login';
    req.flash('login', {
      username: req.body.username,
    });
    next();
  },
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function(req, res, next) {
    if (!req.body.remember_me) { return res.redirect('/calendar/user'); }
    var newToken = new Token({ username: req.user.username, token: randtoken.generate(16) });
    newToken.save(function(err, token) {
      if (err) { return next(err); }
      res.cookie('remember_me', token.token, { path: '/', httpOnly: true, maxAge: 604800000 });
      return res.redirect('/calendar/user');
    });
  }
);


// http://passportjs.org/guide/openid/
// login via NUS only via localhost:8000,
// then continue development on original port.
passport.use('nus', new OpenIDStrategy({
    returnURL: config.site.url + '/login/nus/callback',
    realm: config.site.url,
    profile: true
  },
  function(identifier, profile, done) { // Only calls this function if successfully, I assume.
    var nusId = identifier.slice(26, identifier.length); // Slice identifier: https://openid.nus.edu.sg/[.........] for nusId.
    User.findOne({ nusId: nusId }, function(err, user) {
      if (err) { return done(err); }
      if (!user) { // No such nusId found...
        User.findOne({ username: nusId }, function(err, user) {
          if (err) { return done(err); }
          var userInfo = {
            nusId: nusId,
            status: User.statusTypes.PENDING,
            display_name: profile.displayName,
          };
          var info = {};
          if (user) {
            info.flash = 'Username ' + nusId + ' already taken, please pick another.';
          }
          else { userInfo.username = nusId; }
          User.create(userInfo, function(err, user) { // Make new user.
            return done(null, user, info); // To continue registration.
          });
        });
      }
      if (user) { // nusId found.
        return done(null, user);
      }
    });
  }
));

// Login -> give username and display name
//          -> give blank username if already taken
// -> If not confirmed, redirect to confirm registration.

// NUS login.
router.get('/login/nus',
  redirectIfAuthenticated,
  passport.authenticate('nus')
);
router.get('/login/nus/callback', function(req, res, next) {
  passport.authenticate('nus', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      if (info) {
        if (info.flash) { req.flash('error', info.flash); }
        return res.redirect('/register/continue');
      }

      // Remember me token (automatic).
      var newToken = new Token({ username: user.username, token: randtoken.generate(16) });
      newToken.save(function(err, token) {
        if (err) { return next(err); }
        res.cookie('remember_me', token.token, { path: '/', httpOnly: true, maxAge: 604800000 });
        return res.redirect('/calendar/user');
      });

    });
  })(req, res, next);
});

// Continue registration for OpenID.
router.get('/register/continue', redirectUnlessPending,
  function(req, res) {
    res.render('registerContinue');
  }
);
// Complete registration for OpenID.
router.post('/register/complete', redirectUnlessPending,
  function(req, res, next) {
    var user = req.attach.user;
    user.username = req.body.username;
    user.display_name = req.body.display_name;
    user.status = User.statusTypes.COMPLETE;
    user.save(function(err, user) {
      if (err) { return next(err); }
      req.logout();
      req.login(user, function(err) {
        if (err) { return next(err); }

        // Remember me token (automatic).
        var newToken = new Token({ username: user.username, token: randtoken.generate(16) });
        newToken.save(function(err, token) {
          if (err) { return next(err); }
          res.cookie('remember_me', token.token, { path: '/', httpOnly: true, maxAge: 604800000 });
          return res.redirect('/calendar/user');
        });
      });
    });
  }
);

// Default registration.
router.get('/register', redirectIfAuthenticated,
  function(req, res, next) {
    res.render('register', req.flash('register')[0]);
  }
);

router.post('/register',
  function(req, res, next) {
    res.error.redirect = '/register';
    req.flash('register', {
      username: req.body.username,
      display_name: req.body.display_name,
    });
    next();
  },
  redirectIfAuthenticated,
  User.ensureExistsByUsername(false, ['body', 'username'], 'Username already taken.'),
  function(req, res, next) {
    // Validate password length here, because we are hashing it later.
    if (req.body.password.length < 3 || req.body.password.length > 128) {
      return next(new UserError('Password should be between 3 and 128 characters.'));
    }
    else {
      bcrypt.hash(req.body.password, null, null, function(err, hash) {
        if (err) { return next(err); }

        User.create({
          username: req.body.username,
          display_name : req.body.display_name,
          password: hash,
        }, function(err, user) {
          if (err) { return next(err); }
          if (user) {
            req.login(user, function(err_login) {
              if (err) { return next(err); }        
              return res.redirect('/');
            });
          }
        });  
      });  
    }
  }
);


// Logout
router.post('/logout', function(req, res, next) {
  if (req.user) {
    Token.remove({ username: req.attach.user.username }, function(err) {
      if (err) { return next(err); }
      res.clearCookie('remember_me');
      req.logout();
      return res.redirect('/');
    });
  }
  else {
    return res.redirect('/');
  }
});

module.exports = router;