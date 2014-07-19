var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var timestamps = require('mongoose-timestamp');
var calendarSchema = require('../schema/calendarSchema');
var Schema = mongoose.Schema;

var userSchema = Schema({
  username: { type: String, unique: true },
  email: String,
  display_name: String,
  password: String,
  nusId: String,
  calendars: [{ type: Schema.Types.ObjectId, ref: 'Calendar' }],
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  requests: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  status: { type: Number, default: 2 }
});

userSchema.statics.statusTypes = {
  PENDING: 1,
  COMPLETE: 2,
};

userSchema.path('username').validate(function(value) {
  return /^[a-zA-Z]\w{2,19}$/g.test(value)
}, 'Invalid username.');

userSchema.methods.authPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, res) {
    callback(res);
  });
};

userSchema.methods.hasGroup = function(group) {
  return this.groups.some(function(g) {
    return (g.toString() === group._id.toString());
  });
};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.attach.user.status === userSchema.statics.statusTypes.PENDING) {
      return res.redirect('/register/continue');
    }
    return next();
  }
  else {
    req.flash('error', 'Please log in');
    return res.redirect('/login');
  }
}
userSchema.statics.ensureAuthenticated = function() { return ensureAuthenticated; }

function getNestedValue(obj, keys) {
  var target = obj;
  keys.forEach(function(key) {
    target = target[key];
  })
  return target;
};

// Searches for a user by username, and attach target.
//  source: Array of keys to nest from req, 
//    e.g. ['body', 'username'] => req.body.username
userSchema.statics.ensureExistsByUsername = function(positive, source) {
  var _this = this;
  return function(req, res, next) {
    var target = getNestedValue(req, source);
    _this.findOne({ username: target }, function(err, user) {
      if (err) { return next(err); }
      else if (user) { // Found...
        if (positive) { // ...and we want it to exist!
          req.attach.target = user;
          return next();
        }
        else { return res.send({ error: 'User already exists.' }); } // ...but it does not exist.
      }
      else { // Not found...
        if (positive) { // ...but we want it to exist.
          return res.send({ error: 'User does not exist.' });
        }
        else { return next(); } // ...and it does not exist!
      }
    });
  };
};

userSchema.plugin(timestamps);

module.exports = mongoose.model('User', userSchema);