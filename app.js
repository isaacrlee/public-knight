var express = require('express');
var app = express();
var db = require('./db');

var OrgController = require('./org/OrgController');
app.use('/orgs', OrgController);

module.exports = app;