var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var timestamps = require('mongoose-timestamp');
var calendarSchema = require('../schema/calendarSchema');
var Schema = mongoose.Schema;

var userSchema = Schema({
  username: { type: String, required: true, unique: true },
  email: String,
  display_name: String,
  password: String,
  nusId: String,
  calendars: [{ type: Schema.Types.ObjectId, ref: 'Calendar' }],
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  requests: [{ type: Schema.Types.ObjectId, ref: 'Group' }]
});

userSchema.path('username').validate(function(value) {
  return /^[a-zA-Z]\w{2,}$/g.test(value)
}, 'Invalid username.');

userSchema.methods.authPassword = function(password, callback) {
  bcrypt.compare(password, this.password, function(err, res) {
    callback(res);
  });
};

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
      if (err) { console.log(err); }
      else if (user) { // Found...
        if (positive) { // ...and we want it to exist!
          req.attach.target = user;
          next();
        }
        else { res.send({ error: 'User already exists.' }); } // ...but it does not exist.
      }
      else { // Not found...
        if (positive) { // ...but we want it to exist.
          res.send({ error: 'User does not exist.' });
        }
        else { next(); } // ...and it does not exist!
      }
    });
  };
};

userSchema.statics.attachLoggedIn = function() {
  var _this = this;
  return function(req, res, next) {
    _this.findOne({ username: req.user.username }, function(err, user) {
      if (err) { console.log(err); }
      else if (user) {
        req.attach.user = user;
        next();
      }
      else { res.end(); } // Shouldn't reach here.
    });
  };
};

userSchema.plugin(timestamps);

module.exports = mongoose.model('User', userSchema);