var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
  groupName: String,
  member: Array,
  requested: Array,
  admin: Array
});

groupSchema.plugin(timestamps);

module.exports = mongoose.model('group',groupSchema);