var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();

router.get('/', function(req, res) {
  res.render('login');
})

// The two following methods are relevant to sessions, which
//   are not implemented yet, I think.
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

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
  password: String
});
userSchema.methods.validPassword = function(password) {
  // Needs an encryption solution, probably bcrypt.
  return password === this.password;
};
// Mongoose expects the collection name to be the plural
//   lowercase (?) form of 'User', i.e. 'users'.
var User = mongoose.model('User', userSchema);



// http://passportjs.org/guide/username-password/
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.find({}, function (err, users) {
      console.log(users);
    });
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'No such user.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Wrong password.' });
      }
      return done(null, user);
    }
  )}
));



router.post('/',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/');
})

module.exports = router;