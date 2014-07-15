var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var eventSchema = require('./eventSchema');

var calendarSchema = Schema({
  name: { type: String, required: true },
  events: [eventSchema],
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  hidden: { type:Boolean, default: false}
});


calendarSchema.plugin(timestamps);

module.exports = mongoose.model('Calendar',calendarSchema);