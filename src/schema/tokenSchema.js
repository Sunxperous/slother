var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var UserError = require('../userError.js');

var tokenSchema = Schema({
  username: { type: String, lowercase: true },
  token: { type: String, unique: true }
});

tokenSchema.plugin(timestamps);

module.exports = mongoose.model('Token', tokenSchema);