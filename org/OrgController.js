var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var request = require('request');
router.use(bodyParser.urlencoded({ extended: true }));

var Org = require('./Org');

// CREATES A NEW ORGANIZATION
router.post('/', function (req, res) {
    Org.create({
        tag_slug: req.body.tag_slug,
        tag: req.body.tag,
        tag_guid: req.body.tag_guid,
        org_guid: req.body.org_guid,
        org_slug: req.body.org_slug,
        org_name: req.body.org_name,
        mission: req.body.mission,
        postal_code: req.body.postal_code,
        avatar_image_url: req.body.avatar_image_url,
        header_image_url: req.body.header_image_url
    },
        function (err, org) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(org);
        });
});

// RETURNS ALL THE ORGANIZATIONS IN THE DATABASE
router.get('/', function (req, res) {
    Org.find({}, function (err, orgs) {
        if (err) return res.status(500).send("There was a problem finding the organizations.");
        res.status(200).send(orgs)
    })
})

// RETURNS ALL THE ORGANIZATIONS WITHIN RADIUS MILES OF ZIPCODE IN THE DATABASE
router.get('/zip/:postal_code/:radius/tag/:tag_slug', function (req, res) {
    // INPUT: postal_code
    var api = 'ukFaRmgsfj55CHio9qU2krBWnQv7Z8MusrEkOVM4fS9SArhKSbNcDo90eF7eNUIg';
    var radius = req.params.radius;
    var url = 'https://www.zipcodeapi.com/rest/' + api + '/radius.json/'
    url += req.params.postal_code;
    url += '/' + radius + '/mile';

    // REQUEST

    request(url, function (error, response, body) {
        if (error) return res.status(500).send("There was a problem finding nearby zip codes.");
        var zipCodes = JSON.parse(body).zip_codes;
        var zipArr = []
        for (var i = 0; i < zipCodes.length; i++) {
            zipArr.push(zipCodes[i].zip_code);
        }
        var regex = '/' + zipArr.join('|') + '/';
        // OUTPUT: regex '60660|60659|60712|60645'
        var query = {
            postal_code: { $regex: regex },
            tag_slug: { $eq: req.params.tag_slug },
            avatar_image_url: {
                $exists: true
            },
            mission: {
                $ne: ""
            }
        };
        Org.find(query, function (err, orgs) {
            if (err) return res.status(500).send("There was a problem finding the organizations.");
            res.status(200).send(orgs)
        })
    });
})

// RETURNS ALL THE ORGANIZATIONS WITHIN RADIUS MILES OF ZIPCODE IN THE DATABASE W/TAG IN DATABASE
router.get('/zip/:postal_code/:radius', function (req, res) {
    // INPUT: postal_code
    var api = 'ukFaRmgsfj55CHio9qU2krBWnQv7Z8MusrEkOVM4fS9SArhKSbNcDo90eF7eNUIg';
    var radius = req.params.radius;
    var url = 'https://www.zipcodeapi.com/rest/' + api + '/radius.json/'
    url += req.params.postal_code;
    url += '/' + radius + '/mile';

    // REQUEST

    request(url, function (error, response, body) {
        if (error) return res.status(500).send("There was a problem finding nearby zip codes.");
        var zipCodes = JSON.parse(body).zip_codes;
        var zipArr = []
        for (var i = 0; i < zipCodes.length; i++) {
            zipArr.push(zipCodes[i].zip_code);
        }
        var regex = '/' + zipArr.join('|') + '/';
        // OUTPUT: regex '60660|60659|60712|60645'
        var query = {
            postal_code: { $regex: regex },
            avatar_image_url: {
                $exists: true
            },
            mission: {
                $ne: ""
            }
        };
        Org.find(query, function (err, orgs) {
                if (err) return res.status(500).send("There was a problem finding the organizations.");
                res.status(200).send(orgs)
            })
        });
})

// GETS A SINGLE ORGANIZATION FROM THE DATABASE
router.get('/:id', function (req, res) {
    Org.findById(req.params.id, function (err, org) {
        if (err) return res.status(500).send("There was a problem finding the organization.");
        if (!org) return res.status(404).send("No organization found.");
        res.status(200).send(org);
    });
});

// DELETES AN ORGANIZATION FROM THE DATABASE
router.delete('/:id', function (req, res) {
    Org.findByIdAndRemove(req.params.id, function (err, org) {
        if (err) return res.status(500).send("There was a problem deleting the organization.");
        res.status(200).send("Organization: " + org.org_name + " was deleted.");
    });
});

// UPDATES A SINGLE ORGANIZATION IN THE DATABASE
router.put('/:id', function (req, res) {

    Org.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, org) {
        if (err) return res.status(500).send("There was a problem updating the organization.");
        res.status(200).send(org);
    });
});

module.exports = router;