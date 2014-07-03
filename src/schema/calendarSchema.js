var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var eventSchema = require('./eventSchema');

var calendarSchema = Schema({
  type: String,
  semester: String, //Only for NUS Event 
  events:[eventSchema],
  user:{ type: Schema.Types.ObjectId, ref: 'User' }
});


calendarSchema.plugin(timestamps);

module.exports = calendarSchema;