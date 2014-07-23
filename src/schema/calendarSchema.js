var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var config = require('../config');
var eventSchema = require('./eventSchema');
var User = require('./userSchema');

function randomColor() {
  return config.colors[Math.floor(Math.random() * config.colors.length)];
}

var calendarSchema = Schema({
  name: { type: String, required: 'Calendar name cannot be blank.', trim: true },
  events: [eventSchema],
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  hidden: { type:Boolean, default: false },
  color: {
    type: String,
    default: randomColor,
  }
});

calendarSchema.statics.ensureExist = function (positive, message) {
  var _this = this;
  return function (req, res, next) {
    _this.findById(req.params.calendar_id, function (err, calendar) {
      if (err) { return next(err); }
      else if(calendar) {
        if(positive) {
          req.attach.calendar = calendar;
          return next();
        }
        else {return next(new UserError(message)); }
      }
      else {
        if(positive) {
          return next(new UserError(message));
        }
        else
          return next();
      }
    });
  }
}

calendarSchema.plugin(timestamps);

module.exports = mongoose.model('Calendar',calendarSchema);