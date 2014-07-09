var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var eventSchema = require('./eventSchema');

var calendarSchema = Schema({
  name: String,
  //semester: String, //Only for NUS Event 
  events:[eventSchema],
  user:{ type: Schema.Types.ObjectId, ref: 'User' }
});


calendarSchema.plugin(timestamps);

module.exports = mongoose.model('Calendar',calendarSchema);