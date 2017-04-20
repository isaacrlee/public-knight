var mongoose = require('mongoose');  
var OrgSchema = new mongoose.Schema({  
  tag_slug: String,
  tag: String,
  tag_guid: String,
  org_guid: String,
  org_slug: String,
  org_name: String,
  mission: String,
  postal_code: String,
  avatar_image_url: String,
  header_image_url: String
});

mongoose.model('Org', OrgSchema);
module.exports = mongoose.model('Org');