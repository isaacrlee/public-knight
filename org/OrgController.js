var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var request = require('request');
var lunr = require('lunr');
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
});

// RETURNS ALL THE ORGANIZATIONS WITHIN RADIUS MILES OF ZIPCODE W/TAG IN THE DATABASE
router.get('/zip/:postal_code/:radius/tag/:input', function (req, res) {
    // Creates URL for zipcodeapi
    var api = 'ukFaRmgsfj55CHio9qU2krBWnQv7Z8MusrEkOVM4fS9SArhKSbNcDo90eF7eNUIg';
    var radius = req.params.radius;
    var url = 'https://www.zipcodeapi.com/rest/' + api + '/radius.json/'
    url += req.params.postal_code;
    url += '/' + radius + '/mile';
    // 

    var tagArr = [{"tag":"Animal Protection & Welfare","tag_slug":"animal-protection-welfare-2","synonyms":"animal, endangered, cruelty,  pets, dogs, cats, cat, dog, animal protection, animal welfare, animals, domesticated, animal cruelty, rabbit, wild, wildlife, lion, whale, elephant, panda, bear, fox, deer, snake, species, fish, planet"},
{"tag":"Crime Prevention","tag_slug":"crime-prevention-2","synonyms":"crime, crime prevention, community safety, safety, murder, shooting, shot, death, robbery, theft, security, lost, lives, die, corruption"},
{"tag":"Cultural & Ethnic Awareness","tag_slug":"cultural-ethnic-awareness-2","synonyms":"stereotypes, interfaith, background, race, ethnicity, culture, racism, LGBT, gay, LGBTQ, LGBTQIA, marriage equality, stereotype, racial, institutional racism, gender"},
{"tag":"Disabled Persons' Rights","tag_slug":"disabled-persons-rights-2","synonyms":"disabled, disability, people with disabilities, accessibility, disable, blind, blindness, hearing, disorder, vision, cognitive, mobility, upper limbs, lower limbs, limbs, limb, dexterity, organ, spinal, injury"},
{"tag":"Education","tag_slug":"education-2","synonyms":"Stem, public education system, public education, public school, school, university, ignorance, lack of opportunities, opportunities, teacher, academic, youth, class, test, exam, standardized tests, standardized testing, standardized test, student, students, professors, teachers, classrooms, classroom, homework, exams, science, math, mathematics, humanities, history, literature, english, languages, language, arts education, art, arts funding, buget, funding, scholarship"},
{"tag":"Employment Preparation & Procurement","tag_slug":"employment-preparation-procurement-2","synonyms":"equal opportunities, Job training, halfway homes, professional opportunities, career,  livelihood, job, race, training, unemployment, jobs"},
{"tag":"Health","tag_slug":"health","synonyms":"hospital, Medical, treatment, medicine, disease, healthcare, cancer, cancers, diabetes, diabete, genetic, birth, birth control, metabolic, poisoning, poison, toxicology, infection, medicine "},
{"tag":"Health Care","tag_slug":"health-care","synonyms":"health care, health, public health, medicine, medecine, medical, science, sciences, insurance, reform, health care reform, obamacare, affordable "},
{"tag":"Help the Homeless","tag_slug":"help-the-homeless","synonyms":"poverty, inequality, bed, roof, sleep, housing, shelter, shelters, homeless shelter, shelter, place to sleep"},
{"tag":"Helping Refugees","tag_slug":"refugees-in-america","synonyms":"islamophobia, refugee, refugee camps, Sudan, humantarian crises, flee, escape, Brexit, crisis, home, shelter, camp"},
{"tag":"Homeless Shelters","tag_slug":"homeless-shelters-2","synonyms":"shelter, camp, homeless, poor, poverty, durgs"},
{"tag":"Immigrant Rights","tag_slug":"immigrant-rights","synonyms":"islamophobia, welcoming, flee, escape, immigrant, immigration, rights, right "},
{"tag":"Mental Health","tag_slug":"mental-health","synonyms":"mental disorders, mental health, mental, disorder, stigma, mind, psych, Depression, anxiety, Stress, personality disorder, dementia, bipolar, bipolar disorder, Alzheimers'"},
{"tag":"Minority Rights","tag_slug":"minority-rights-2","synonyms":"minorities, minority, black rights, black lives matter, diversity, inclusion, inclusive, civil rights"},
{"tag":"Natural Resources Conservation & Protection","tag_slug":"natural-resources-conservation-protection-2","synonyms":"green energy, renewable energy, greenhouse gases, Greenhouse, environmentalism, Eco-friendly, eco friendly, sustainable, carbon footprint, footprint, rising sea levels, rising, oceans, air, wind, carbon, oil, global warming, climate, Natural, conservation, marine, forest, conserve, energy, reusable, pollution, polluted, Pollute, drought, droughts, deforestation, sustainability, climate change, natural disaster, clean air, clean water, clean energy"},
{"tag":"Stop Gun Violence","tag_slug":"stop-gun-violence","synonyms":"gun, gun violence, violence, firearms, fire arms, gangs, gang, gang violence"},
{"tag":"Suicide Prevention","tag_slug":"suicide-prevention","synonyms":"depression, suicidal, therapy, kill themselves, loneliness"},
{"tag":"Teaching Tolerance, Fighting Hate","tag_slug":"teaching-tolerance-fighting-hate","synonyms":"tolerant, understanding, islamophobia, tolerance"},
{"tag":"Violence Prevention","tag_slug":"violence-prevention","synonyms":"domestic violence, gang, gun"},
{"tag":"Women's Rights","tag_slug":"women-s-rights-2","synonyms":"women, Sexual assault, assault, domestic violence, domestic, gender, gender discrimination, rape, women and STEM, STEM opportunities, women in tech, men"},
{"tag":"Youth Centers & Clubs","tag_slug":"youth-centers-clubs-2","synonyms":"YMCA, Children, kids, afterschool, Boys, girls, students, youth, youths, community centers, community, extracurricular"}];

    // splits synonyms into array
    for (var i = 0; i < tagArr.length; i++) {
        tagArr[i].synonyms = tagArr[i].synonyms.split(', ');
    }
    // 

    // uses lunr to get desired tag_slug
    console.log(req.params.input);
    var tag_slug = "";

    var idx = lunr(function () {
        this.field('tag');
        this.ref('tag_slug');
        this.field('synonyms');

        for (var i = 0; i < tagArr.length; i++) {
            this.add(tagArr[i]);
        }
    });

    console.log(tag_slug);
    try {
        console.log(idx.search(req.params.input + '~1 *' + req.params.input + ' ' + req.params.input + '*'));
        tag_slug = idx.search(req.params.input + '~1 *' + req.params.input + ' ' + req.params.input + '*')[0].ref;
    } catch (err) {
        tag_slug = "education-2";
    }
    //

    // requests from database
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