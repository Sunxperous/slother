// Requires. Indentation signifies "dependence".
var express = require('express');
var methodOverride = require('method-override');
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
app.use(express.static(__dirname + '/public'));
app.use(applyLocals()); // Locals for jade templates, attaches for user-defined functions.
app.use('/', login);
app.use('/', routes);
app.use('/calendar', calendar);
app.use('/extract', extractMod);
app.use('/group', group);
app.use('/user', user);

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