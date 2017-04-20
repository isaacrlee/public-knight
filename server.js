// const path = require('path')
const express = require('express')
// const exphbs = require('express-handlebars')
// const jsonfile = require('jsonfile')

var app = require('./app');
var port = process.env.PORT || 5000;

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});