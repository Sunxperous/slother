var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var config = require('../config');
var Hashids = require('hashids');
  var hashids = new Hashids(config.hashid.salt);
var UserError = require('../userError.js');

function randomColor() {
  return config.colors[Math.floor(Math.random() * config.colors.length)];
}

var groupSchema = new Schema({
  groupName: { type: String, required: 'Group name cannot be blank.', trim: true },
  members: [{
    _id: {
      type: Schema.Types.ObjectId, ref: 'User',
    },
    color: {
      type: String,
      default: randomColor
    }
  }],
  requested: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  created_by: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Specify type for array to search in, defaults to 'members'.
groupSchema.methods.hasUser = function(user, type) {
  type = type || 'members';
  return this[type].some(function(member) { // .some returns true prematurely.
    if (type === 'members') {
      return (member._id.toString() === user._id.toString());
    }
    else {
      return (member.toString() === user._id.toString());
    }
  });
};

groupSchema.statics.userInGroup = function(_user, positive, type, message) {
  return function(req, res, next) {
    var group = req.attach.group;
    var user = req.attach[_user];
    if (group && user) { // Compulsory to have.
      var hasUser;
      if (type === 'requested') { hasUser = group.hasUser(user, type); }
      else { hasUser = group.hasUser(user, type) && user.hasGroup(group) }
      if (positive) { // We want user in group list...
        if (hasUser) { return next(); } // ...yay!
        else { // ...nope, user is not in group list.
          return next(new UserError(message));
        }
      }
      else { // We don't want user in group list...
        if (hasUser) { // ...nope, user is in group list.
          return next(new UserError(message));
        }
        else { return next(); } // ...yay!
      }
    }
  }
};

groupSchema.statics.ensureExistsByHash = function() {
  var _this = this;
  return function(req, res, next, hash) {
    var group_id = _this.decryptHash(hash);
    _this.findById(group_id, function(err, group) {
      if (err) { return next(err); }
      if (group) {
        req.attach.group = group;
        return next();
      }
      return next(new UserError('There is no such group.'));
    });
  }
};

groupSchema.methods.getUrl = function() {
  var friendly_url = this.groupName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  return '/calendar/group/' + this.getHash() + '/' + friendly_url;
};

groupSchema.statics.getHashOfId = function(id) {
  return hashids.encryptHex(id);
};

groupSchema.methods.getHash = function() {
  return hashids.encryptHex(this._id);
};

groupSchema.statics.decryptHash = function(hash) {
  return hashids.decryptHex(hash);
};

groupSchema.plugin(timestamps);

module.exports = mongoose.model('Group', groupSchema);