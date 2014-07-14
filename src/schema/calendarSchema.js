var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var eventSchema = require('./eventSchema');

var calendarSchema = Schema({
  name: { type: String, required: true },
  events: [eventSchema],
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  hidden: { type:Boolean, default: false}
});


calendarSchema.plugin(timestamps);

module.exports = mongoose.model('Calendar',calendarSchema);