var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var timestamps = require('mongoose-timestamp');
var calenderSchema = require('../schema/calenderSchema');
var Schema = mongoose.Schema;

var userSchema = Schema({
  username: String,
  password: String,
  nusId: String,
  calender: [{ type: Schema.Types.ObjectId, ref: 'Calender' }],
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  requests: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
});

userSchema.methods.authPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, res) {
    callback(res);
  });
};

userSchema.plugin(timestamps);

module.exports = mongoose.model('User', userSchema);