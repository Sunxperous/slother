var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var timestamps = require('mongoose-timestamp');
var eventSchema = require('../schema/eventSchema');
var Schema = mongoose.Schema;

var userSchema = Schema({
  username: String,
  password: String,
  nusId: String,
  events: [eventSchema],
  group: Array,
  request: Array
});

userSchema.methods.authPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, res) {
    callback(res);
  });
};

userSchema.plugin(timestamps);

module.exports = mongoose.model('user',userSchema);