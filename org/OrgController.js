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

// RETURNS ALL THE ORGANIZATIONS WITHIN RADIUS MILES OF ZIPCODE W/TAG IN THE DATABASE
router.get('/zip/:postal_code/:radius/tag/:tag_input', function (req, res) {
    // Creates URL for zipcodeapi
    var api = 'ukFaRmgsfj55CHio9qU2krBWnQv7Z8MusrEkOVM4fS9SArhKSbNcDo90eF7eNUIg';
    var radius = req.params.radius;
    var url = 'https://www.zipcodeapi.com/rest/' + api + '/radius.json/'
    url += req.params.postal_code;
    url += '/' + radius + '/mile';
    // 

    // Matches tag_input to tag_slug
    var tagDict = [{ "tag_slug": "animal-protection-welfare-2", "synonyms": "animal, endangered, cruelty,  pets, dogs, cats" },
    { "tag_slug": "crime-prevention-2", "synonyms": "" },
    { "tag_slug": "cultural-ethnic-awareness-2", "synonyms": "Stereotypes, interfaith, background, race, ethnicity, culture, racism, LGBT, gay" },
    { "tag_slug": "disabled-persons-rights-2", "synonyms": "disabled, disability, people with disabilities, accessibility, disable" },
    { "tag_slug": "education-2", "synonyms": "Stem, public education system, public education, public school, school, university, ignorance, lack of opportunities, opportunities, teacher, academic,  youth, class, test, exam" },
    { "tag_slug": "employment-preparation-procurement-2", "synonyms": "equal opportunities, Job training, halfway homes, professional opportunities, career,  livelihood, job" },
    { "tag_slug": "health", "synonyms": "hospital, Medical, treatment, medicine, disease" },
    { "tag_slug": "health-care", "synonyms": "" },
    { "tag_slug": "help-the-homeless", "synonyms": "poverty, inequality, bed, roof, Sleep" },
    { "tag_slug": "refugees-in-america", "synonyms": "islamophobia, " },
    { "tag_slug": "homeless-shelters-2", "synonyms": "" },
    { "tag_slug": "immigrant-rights", "synonyms": "islamophobia, welcoming, flee, escape" },
    { "tag_slug": "mental-health", "synonyms": "mental disorders, mental health, mental, disorder, stigma, mind, psych, Depression, anxiety, Stress" },
    { "tag_slug": "minority-rights-2", "synonyms": "" },
    { "tag_slug": "natural-resources-conservation-protection-2", "synonyms": "green energy, renewable energy, greenhouse gases, Greenhouse, environmentalism, Eco-friendly, eco friendly, sustainable, carbon footprint, footprint, rising sea levels, rising, oceans, air, wind, carbon, oil, global warming, climate, Natural, conservation, marine, forrest, conserve, energy, reusable, pollution, polluted, Pollute, drought" },
    { "tag_slug": "stop-gun-violence", "synonyms": "gun" },
    { "tag_slug": "suicide-prevention", "synonyms": "depression, suicidal, therapy, kill themselves, loneliness" },
    { "tag_slug": "teaching-tolerance-fighting-hate", "synonyms": "tolerant, understanding, islamophobia" },
    { "tag_slug": "violence-prevention", "synonyms": "domestic violence, gang, gun" },
    { "tag_slug": "women-s-rights-2", "synonyms": "Sexual assault, assault, domestic violence, domestic, gender, gender discrimination, rape, women and STEM, STEM opportunities, women in tech, men" },
    { "tag_slug": "youth-centers-clubs-2", "synonyms": "YMCA, Children, kids, afterschool, Boys, girls, students, youth" }]

    var input = req.params.tag_input;
    console.log(input);
    var tag_slug = "";
        // checks if tag_input in tag_slug OR synonyms
    for (var i = 0; i < tagDict.length; i++) {
        var splitSlug = tagDict[i].tag_slug.split('-'); //ex. ["crime","prevention","2"]
        var synonyms = tagDict[i].synonyms.split(', ');
        var matchTest = splitSlug.concat(synonyms);
        console.log(matchTest);
        if (matchTest.includes(input)) {
            tag_slug = tagDict[i].tag_slug;
            break;
        }
    }
    console.log(tag_slug);

    // tag_slug is the desired tag_slug now
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
            tag_slug: { $eq: tag_slug },
            // avatar_image_url: {
            //     $exists: true
            // }
            // },
            // mission: {
            //     $ne: ""
            // }
        };
        Org.find(query, function (err, orgs) {
            if (err) return res.status(500).send("There was a problem finding the organizations.");
            res.status(200).send(orgs)
        })
    });
})

// RETURNS ALL THE ORGANIZATIONS WITHIN RADIUS MILES OF ZIPCODE IN THE DATABASE IN DATABASE
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