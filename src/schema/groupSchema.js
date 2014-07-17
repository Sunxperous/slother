var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var config = require('../config');
var Hashids = require('hashids');
  var hashids = new Hashids(config.hashid.salt);

var groupSchema = new Schema({
  groupName: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  requested: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  created_by: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Specify type for array to search in, defaults to 'members'.
groupSchema.methods.hasUser = function(user, type) {
  type = type || 'members';
  return this[type].some(function(member) { // .some returns true prematurely.
    return (member.toString() === user._id.toString());
  });
};

groupSchema.methods.getHash = function() {
  return hashids.encryptHex(this._id);
};

groupSchema.statics.decryptHash = function(hash) {
  return hashids.decryptHex(hash);
}

// Searches for a group by hashed id, and attach group.
groupSchema.statics.ensureExistsByHash = function(positive) {
  var _this = this;
  return function(req, res, next) {
    var group_id = _this.decryptHash(req.params.hash);
    _this.findById(group_id, function(err, group) {
      if (err) { console.log(err); }
      else if (group) { // Group found...
        if (positive) { // ...and we want it to exist!
          req.attach.group = group;
          next();
        }
        else { res.send({ error: 'Group already exists.' }); } // ...but it does not exist.
      }
      else { // Group not found...
        if (positive) { // ...but we want it to exist.
          res.send({ error: 'Group does not exist.' });
        }
        else { next(); } // ...and it does not exist!
      }
    });
  };
};

groupSchema.plugin(timestamps);

module.exports = mongoose.model('Group', groupSchema);