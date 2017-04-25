var express = require('express');
var app = express();
var db = require('./db');

var OrgController = require('./org/OrgController');

app.get('/', function (req, res) {
  res.send(`<h1>API Endpoints</h1>
  <p>GET /orgs Returns all the organizations in the database</p>
  <p>GET /orgs/tag/{tag} Returns all the organizations w/tag in the database</p>
  <p>GET /orgs/zip/{zip_code}/{radius} Returns all the organizations within {radius} miles of zipcode in the database</p>
  <p>GET /orgs/zip/{zip_code}/{radius}/tag/{tag} Returns all the organizations in the database</p>
  <p>GET /orgs/{id} Gets a single organization from the database</p>
  <p>POST /orgs/ Creates a new organization</p>
  <p>DELETE /orgs/{id} Deletes an organization from the database</p>
  <p>PATCH /orgs/{id} Updates a single organization in the database</p>`)
});

app.use('/orgs', OrgController);

module.exports = app;