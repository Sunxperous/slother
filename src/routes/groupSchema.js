var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Schema = mongoose.Schema;

var groupSchema = new Schema({
  groupName: String,
  member: Array,
  schedule: Array
});

module.exports = mongoose.model('group',groupSchema);