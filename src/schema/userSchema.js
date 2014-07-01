var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var userSchema = mongoose.Schema({
  username: String,
  password: String,
  nusId: String,
  events: Array,
  group: Array,
  request: Array
});

userSchema.methods.authPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, res) {
    callback(res);
  });
};

module.exports = mongoose.model('user',userSchema);