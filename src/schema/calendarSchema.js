var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var config = require('../config');
var eventSchema = require('./eventSchema');

function randomColor() {
  return config.colors[Math.floor(Math.random() * config.colors.length)];
}

var calendarSchema = Schema({
  name: { type: String, required: true },
  events: [eventSchema],
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  hidden: { type:Boolean, default: false },
  color: {
    type: String,
    default: randomColor,
  }
});


calendarSchema.plugin(timestamps);

module.exports = mongoose.model('Calendar',calendarSchema);