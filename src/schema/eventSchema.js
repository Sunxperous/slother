var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var eventSchema = Schema({
  summary: String,
  description: String,
  location: String,
  rrule: { freq: String, count: Number },
  exclude: [Date],
  dateStart: Date,
  dateEnd: Date
});

userSchema.plugin(timestamps);

module.exports = eventSchema;