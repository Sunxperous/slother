var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
  groupName: String,
  member: Array,
});

module.exports = mongoose.model('group',groupSchema);