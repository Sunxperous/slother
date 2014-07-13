var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var eventSchema = Schema({
  summary: { type: String, required: true },
  description: String,
  location: String,
  rrule: { freq: String, count: { type: Number, min: 1 } },
  exclude: [Date],
  dateStart: Date,
  dateEnd: Date
});

eventSchema.plugin(timestamps);

module.exports = eventSchema;