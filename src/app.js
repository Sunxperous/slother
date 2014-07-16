// Requires. Indentation signifies "dependence".
var express = require('express');
  var session = require('express-session');
  var cookieParser = require('cookie-parser');
  var flash = require('connect-flash');
  var passport = require('passport');
    var bodyParser = require('body-parser');
  var mongoose = require('mongoose');
    var User = require('./schema/userSchema');
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
app.set('hashids', hashids);

// Routing.
var routes = require('./routes/index');
var login = require('./routes/login');
var extractMod = require('./routes/extractMod');
var calendar = require('./routes/calendar');
var group = require('./routes/group');
var user = require('./routes/user');

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Middleware.
app.use(cookieParser());
app.use(session({ secret: config.app.sessionSecret }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser());
app.use(applyLocals()); // Locals for jade templates, attaches for user-defined functions.
app.use(express.static(__dirname + '/public'));
app.use('/', login);
app.use('/', routes);
app.use('/calendar', calendar);
app.use('/extract', extractMod);
app.use('/group', group);
app.use('/user', user);

// Something broke middleware.
// Maybe can render a Sloth sleeping.
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(500, 'Something broke...');
});

var server = app.listen(app.get('port'), function() {
  console.log('Listening on port %d', server.address().port);
});

function applyLocals() {
  return function(req, res, next) {
    var flashMessages = {};
    flashMessages.alerts = req.flash('alert');
    flashMessages.errors = req.flash('error');
    flashMessages.requests = req.flash('requests');
    app.locals.messages = flashMessages;

    req.attach = {};

    if (req.isAuthenticated()) {
      User.findOne({ username: req.user.username }, function(err, user) {
        if (err) { console.log(err); }
        else {
          app.locals.user = user;
          req.attach.user = user;
          next();
        }
      });
    }
    else {
      next ();
    }
  }
}

module.exports = app;