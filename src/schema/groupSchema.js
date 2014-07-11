var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
  groupName: String,
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  requested: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

// Specify type for array to search in, defaults to 'members'.
groupSchema.methods.hasUser = function(user, type) {
  type = type || 'members';
  return this[type].some(function(member) { // .some returns true prematurely.
    return (member.toString() === user._id.toString())
  });
};

groupSchema.plugin(timestamps);

module.exports = mongoose.model('Group', groupSchema);