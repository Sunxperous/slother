// Requires. Indentation signifies "dependence".
var express = require('express');
var methodOverride = require('method-override');
  var session = require('express-session');
    var RememberMeStrategy = require('passport-remember-me').Strategy;
  var cookieParser = require('cookie-parser');
  var flash = require('connect-flash');
  var passport = require('passport');
    var bodyParser = require('body-parser');
  var mongoose = require('mongoose');
    var User = require('./schema/userSchema');
    var Token = require('./schema/tokenSchema');
      var randtoken = require('rand-token');
var path = require('path');
var http = require('http');
var config = require('./config');
var Hashids = require('hashids');
  var hashids = new Hashids(config.hashid.salt);

// Mongoose and Express.
mongoose.connect(config.db.uri);
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('port', config.app.port);

// Routing.
var routes = require('./routes/index');
var group = require('./routes/group');
var user = require('./routes/user');
var login = require('./routes/login');
var extractMod = require('./routes/extractMod');
var calendar = require('./routes/calendar');

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use(new RememberMeStrategy(
  function consumeToken(token, done) {
    Token.findOneAndRemove({ token: token }, function(err, token) {
      if (err) { return done(err, null); }
      if (!token) { return done(null, false); }
      User.findOne({ username: token.username }, function(err, user) {
        if (err) { return done(err, null); }
        if (!user) { return done(null, false); }
        return done(null, user);
      });
    });
  },
  function issueToken(user, done) {
    // Got to ensure unique token next time, and modularize app.js.
    var newToken = new Token({ username: user.username, token: randtoken.generate(16) });
    newToken.save(function(err, token) {
      if (err) { return done(err, null); }
      return done(null, token.token);
    });
  }
));

// Middleware.
app.use(bodyParser());
app.use(cookieParser());
app.use(session({ secret: config.app.sessionSecret }));
app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));
app.use(express.static(__dirname + '/public'));
app.use(applyLocals()); // Locals for jade templates, attaches for user-defined functions.
app.use('/', login);
app.use('/', routes);
app.use('/group', group);
app.use('/user', user);
app.use('/calendar', calendar);
app.use('/extract', extractMod);

// Errors final middleware.
// Maybe can render a Sloth sleeping.
app.use(function(err, req, res, next) {
  if (err.name === 'ValidationError' || err.name === 'UserError') {
    var message = err.message;
    if (err.name === 'ValidationError') {
      // Trim 'ValidatorError: ' from validation messages.
      message = err.toString().substr(17);
    }
    console.log(err);
    return res.format({
      'application/json': function() {
        return res.send({ 'error': message });
      },

      'text/html': function() {
        req.flash('error', message);
        return res.redirect(res.error.redirect || '/calendar/user');
      }
    });
  }
  console.error(err.stack);
  return res.send(500, 'What went wrong?');
});

var server = app.listen(app.get('port'), function() {
  console.log('Listening on port %d', server.address().port);
});

function applyLocals() {
  return function(req, res, next) {
    app.locals.title = "Slother";

    var flashMessages = {};
    flashMessages.alerts = req.flash('alert');
    flashMessages.errors = req.flash('error');
    flashMessages.requests = req.flash('requests');
    flashMessages.success = req.flash('success');
    res.locals.messages = flashMessages;

    req.attach = {};
    res.error = {};

    if (req.isAuthenticated()) {
      User.findOne({ username: req.user.username })
      .select('-password -updated_at -created_at')
      .exec(function(err, user) {
        if (err) { return next(err); }
        else {
          res.locals.user = user;
          req.attach.user = user;
          return next();
        }
      });
    }
    else {
      return next();
    }
  }
}

module.exports = app;