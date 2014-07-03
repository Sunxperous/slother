var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;
var eventSchema = require('./eventSchema');

var calenderSchema = Schema({
  type: String,
  semester: String, //Only for NUS Event 
  events:[eventSchema],
  username:{ type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = calenderSchema;