var express = require('express');
var path = require('path');
var http = require('http');

var app = express();

var routes = require('./routes/index');

app.use('/', routes);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('port', 8000);

var server = app.listen(8000, function() {
  console.log('Listening on port %d', server.address().port);
});

module.exports = app;