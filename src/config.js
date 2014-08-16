// Duplicate this file without .sample in the file name.

var config = {};

config.hashid = {};
config.hashid.salt = process.env.SALT || 'this is my salt';

config.app = {};
config.app.env = process.env.NODE_ENV || 'development';
config.app.port = process.env.PORT || 8000;
config.app.sessionSecret = process.env.SECRET || 'keyboard cat';

config.db = {};
config.db.uri = process.env.MONGOLAB_URI || 'mongodb://localhost/test';

config.site = {};
config.site.url = process.env.SITE_URL || 'http://localhost:8000';

config.colors = ['#ffb2b2', '#ffc8b2', '#ffddb2', '#ffefb2', '#ffffb2', '#c8ffb2', '#b2ffc9', '#b2fff3', '#b2e0ff', '#b2baff', '#d4b2ff', '#fcb2ff'];

module.exports = config;
