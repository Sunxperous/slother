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
    _id: { type: Schema.Types.ObjectId, ref: 'User', },
    color: {
      type: String,
      default: randomColor
    },
    role: { type: Number }
  }],
  requested: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  calendar: {type: Schema.Types.ObjectId, ref:'Calendar'}
});

groupSchema.statics.roles = {
  REQUESTED : 0,
  MEMBER    : 1,
  ADMIN     : 2,
  OWNER     : 3,
};

groupSchema.methods.switchRoleById = function(id, role) {
  for (var i = 0; i < this.members.length; i++) {
    if (id.toString() === this.members[i]._id.toString()) {
      var member = this.members[i];
      member.role = role;
      this.members.set(i, member);
      return member;
    }
  }
};
groupSchema.methods.removeMemberById = function(id) {
  var i;
  for (i = 0; i < this.members.length; i++) {
    if (id.toString() === this.members[i]._id.toString()) { break; }
  }
  return this.members.splice(i, 1)[0];
};
groupSchema.methods.changeColorById = function(id, color) {
  for (var i = 0; i < this.members.length; i++) {
    if (id.toString() === this.members[i]._id.toString()) {
      var member = this.members[i];
      member.color = color;
      this.members.set(i, member);
      return member;
    }
  }  
};

// Checks if user is of role in group.
groupSchema.methods.hasUser = function(user, role) {
  return this.members.some(function(member) { // .some returns true prematurely.
    return (member._id.toString() === user._id.toString()
      && member.role >= role);
  });
};

groupSchema.statics.userIsType = function(_user, positive, role, message) {
  var _this = this;
  return function(req, res, next) {
    var group = req.attach.group;
    var user = req.attach[_user];
    if (group && user) { // Compulsory to have.
      var hasUser;

      // Check only role if requested, else also check if user has group.
      if (role === _this.roles.REQUESTED) { hasUser = group.hasUser(user, role); }
      else { hasUser = group.hasUser(user, role) && user.hasGroup(group) }

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