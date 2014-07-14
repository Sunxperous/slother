var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var planSchema = Schema({
  name: { type: String, required: true },
  timeSlots: [Date],
  votes: [{voters:{ type: Schema.Types.ObjectId, ref: 'User'},
           votes: Date
          }],
  finalized: { type:Boolean, default: false }
});


calendarSchema.plugin(timestamps);

module.exports = mongoose.model('Plan',planSchema);