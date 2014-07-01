var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
  groupName: String,
  member: Array,
  requested: Array,
  admin: Array
});

module.exports = mongoose.model('group',groupSchema);