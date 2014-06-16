var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
//var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var OpenIDStrategy = require('passport-openid').Strategy;
var router = express.Router();
var config = require('../config');



// Login page.
router.get('/', function(req, res) {
  res.render('login');
})

// http://mongoosejs.com/docs/index.html
//
// Insert a mock user in MongoDB:
//   Run "mongo" in the console, then
//     > db.users.insert({username: 'qwe', password: 'qwe'});
//     > db.users.find()
// Go to localhost:port/login and enter the username and password,
//   login should be successful and redirect to /.  
var userSchema = mongoose.Schema({
  username: String,
  password: String,
  nusId: String
});
userSchema.methods.validPassword = function(password) {
  // Needs an encryption solution, probably bcrypt.

  // Apparently disallows empty passwords (if they registered via openID).
  return password === this.password;
};
// Mongoose expects the collection name to be the plural
//   lowercase (?) form of 'User', i.e. 'users'.
var User = mongoose.model('User', userSchema);



// http://passportjs.org/guide/username-password/
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'No such user.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Wrong password.' });
      }
      return done(null, user);
    });
  }
));

// Default login request.
router.post('/default',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);



// http://passportjs.org/guide/openid/
// login via NUS only via localhost:8000,
// then continue development on original port.
passport.use('nus', new OpenIDStrategy({
    returnURL: 'http://localhost:8000/login/nus/callback',
    realm: 'http://localhost:8000/',
  },
  function(identifier, done) { // Only calls this function if successfully, I assume.
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

// Nus login.
router.get('/nus', passport.authenticate('nus'));
router.get('/nus/callback', passport.authenticate('nus', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);


// Default registration.
router.get('/register', function(req, res) {
  res.render('register');
});

router.post('/register', function(req, res) {
  // Assuming valid, non-existing user...
  User.create({
    username: req.body.username,
    password: req.body.password
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

module.exports = router;