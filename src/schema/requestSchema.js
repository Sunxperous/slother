var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var config = require('../config');
var Hashids = require('hashids');
  var hashids = new Hashids(config.hashid.salt);
var Schema = mongoose.Schema;

var requestSchema = Schema({
  type: { type: Number, required: true },
  requester: { type: Schema.Types.ObjectId, ref: 'User' },
  dismissed: { type: Boolean, default: false },
  subject_id: { type: Schema.Types.ObjectId },
  description: { type: String },
});

requestSchema.types = {
  USER: 1,
  GROUP: 2,
};

requestSchema.methods.getUrl = function(action) {
  action = action || "";
  switch(this.type) {
    case requestSchema.types.USER:
      break;
    case requestSchema.types.GROUP:
      return '/group/' + hashids.encryptHex(this.subject_id) + '/' + action;
      break;
    default:
      break;
  }
};

requestSchema.plugin(timestamps);

module.exports = requestSchema;