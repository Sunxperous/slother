// Requires. Indentation signifies "dependence".
var express = require('express');
  var session = require('express-session');
  var cookieParser = require('cookie-parser');
  var passport = require('passport');
    var bodyParser = require('body-parser');
  var mongoose = require('mongoose');
var path = require('path');
var http = require('http');
var config = require('./config');

// Mongoose and Express.
mongoose.connect('mongodb://localhost/test');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('port', 8000);

// Routing.
var routes = require('./routes/index');
var login = require('./routes/login');

// Passport serialization, e.g. id to user.
// Something like that I think.
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Middleware.
app.use(cookieParser());
app.use(session({ secret: 'keyboard neko' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use('/login', login);
app.use('/', routes);

// Something broke middleware.
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(500, 'Something broke...');
});

var server = app.listen(8000, function() {
  console.log('Listening on port %d', server.address().port);
});

module.exports = app;