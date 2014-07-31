var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var moment = require('moment');
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

eventSchema.pre('save', function sanitizeExcludes(next) {
  var dateStart = moment(this.dateStart);
  var dateFinalStart = dateStart.clone();
  if (this.exclude && this.exclude.length > 0) {
    var sanitizedExcludes = this.exclude.filter(function(excludedDate, index) {
      var date = moment(excludedDate);
      switch (this.rrule.freq) {
        case 'ONCE':
          return false; // There should be no excludes for ONCE.
        case 'DAILY':
          if (date.isBefore(dateStart)) { return false; }
          dateFinalStart.add(this.rrule.count, 'days');
          if (date.isAfter(dateFinalStart)) { return false; }
          return true;
        case 'WEEKLY':
          if (date.isBefore(dateStart)) { return false; }
          dateFinalStart.add(this.rrule.count, 'weeks');
          if (date.isAfter(dateFinalStart)) { return false; }
          if (date.day() !== dateStart.day()) { // Different day of week...
            return false;
          }
          return true;
        case 'MONTHLY':
          if (date.isBefore(dateStart)) { return false; }
          dateFinalStart.add(this.rrule.count, 'months');
          if (date.isAfter(dateFinalStart)) { return false; }
          if (date.date() !== dateStart.date()) { return false; }
          return true;
        case 'YEARLY':
          if (date.isBefore(dateStart)) { return false; }
          dateFinalStart.add(this.rrule.count, 'years');
          if (date.isAfter(dateFinalStart)) { return false; }
          if (date.date() !== dateStart.date() ||
            date.month() !== dateStart.month()) { return false; }
          return true;
        default:
          return true;
      }
    }, this);
    sanitizedExcludes.sort();
    this.set('exclude', sanitizedExcludes);
    this.exclude.sort();
  }
  next();
});

eventSchema.plugin(timestamps);

module.exports = eventSchema;