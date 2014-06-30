// Duplicate this file without .sample in the file name.

var config = {};

config.app = {};
config.app.port = process.env.PORT || 8000;
config.app.sessionSecret = 'keyboard cat';

config.db = {};
config.db.uri = process.env.MONGOLAB_URI || 'mongodb://localhost/test';

config.nus = {};
config.nus.openId = 'http://localhost:8000';

module.exports = config;