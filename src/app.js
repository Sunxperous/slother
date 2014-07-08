// Requires. Indentation signifies "dependence".
var express = require('express');
  var session = require('express-session');
  var cookieParser = require('cookie-parser');
  var flash = require('connect-flash');
  var passport = require('passport');
    var bodyParser = require('body-parser');
  var mongoose = require('mongoose');
var path = require('path');
var http = require('http');
var config = require('./config');

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
app.use('/extract', extractMod);
app.use('/calendar', calendar);
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
    app.locals.user = req.user;
    var flashMessages = {};
    flashMessages.alerts = req.flash('alert');
    flashMessages.errors = req.flash('error');
    flashMessages.requests = req.flash('requests');
    app.locals.messages = flashMessages;

    req.attach = {};
    next();
  }
}

module.exports = app;