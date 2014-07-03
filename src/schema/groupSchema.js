var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
  groupName: String,
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  requested: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

groupSchema.plugin(timestamps);

module.exports = mongoose.model('Group', groupSchema);