var express = require('express');
var app = express();
var db = require('./db');
var path = require('path');
var lunr = require('lunr');
var request = require('request');
var cheerio = require('cheerio');

var OrgController = require('./org/OrgController');

app.get('/', function (req, res) {
  res.send(`<h1>API Endpoints</h1>
  <p>GET /orgs Returns all the organizations in the database</p>
  <p>GET /orgs/zip/{zip_code}/{radius} Returns all the organizations within {radius} miles of zipcode in the database</p>
  <p>GET /orgs/zip/{zip_code}/{radius}/tag/{tag} Returns all the organizations within {radius} miles of zipcode in the database w/tag in the database</p>
  <p>GET /orgs/{id} Gets a single organization from the database</p>
  <p>POST /orgs/ Creates a new organization</p>
  <p>DELETE /orgs/{id} Deletes an organization from the database</p>
  <p>PATCH /orgs/{id} Updates a single organization in the database</p>`)
});

app.get('/trib', function (req, res) {
  res.sendFile(path.join(__dirname + '/trib.html'));
});

app.get('/tag/:input', function (req, res) {
  var tagArr = [{ "tag": "Animal Protection & Welfare", "tag_slug": "animal-protection-welfare-2", "synonyms": "animal, endangered, cruelty,  pets, dogs, cats, cat, dog, animal protection, animal welfare, animals, domesticated, animal cruelty, rabbit, wild, wildlife, lion, whale, elephant, panda, bear, fox, deer, snake, species, fish, planet" },
  { "tag": "Crime Prevention", "tag_slug": "crime-prevention-2", "synonyms": "crime, crime prevention, community safety, safety, murder, shooting, shot, death, robbery, theft, security, lost, lives, die, corruption" },
  { "tag": "Cultural & Ethnic Awareness", "tag_slug": "cultural-ethnic-awareness-2", "synonyms": "stereotypes, interfaith, background, race, ethnicity, culture, racism, LGBT, gay, LGBTQ, LGBTQIA, marriage equality, stereotype, racial, institutional racism, gender" },
  { "tag": "Disabled Persons' Rights", "tag_slug": "disabled-persons-rights-2", "synonyms": "disabled, disability, people with disabilities, accessibility, disable, blind, blindness, hearing, disorder, vision, cognitive, mobility, upper limbs, lower limbs, limbs, limb, dexterity, organ, spinal, injury" },
  { "tag": "Education", "tag_slug": "education-2", "synonyms": "Stem, public education system, public education, public school, school, university, ignorance, lack of opportunities, opportunities, teacher, academic, youth, class, test, exam, standardized tests, standardized testing, standardized test, student, students, professors, teachers, classrooms, classroom, homework, exams, science, math, mathematics, humanities, history, literature, english, languages, language, arts education, art, arts funding, buget, funding, scholarship" },
  { "tag": "Employment Preparation & Procurement", "tag_slug": "employment-preparation-procurement-2", "synonyms": "equal opportunities, Job training, halfway homes, professional opportunities, career,  livelihood, job, race, training, unemployment, jobs" },
  { "tag": "Health", "tag_slug": "health", "synonyms": "hospital, Medical, treatment, medicine, disease, healthcare, cancer, cancers, diabetes, diabete, genetic, birth, birth control, metabolic, poisoning, poison, toxicology, infection, medicine " },
  { "tag": "Health Care", "tag_slug": "health-care", "synonyms": "health care, health, public health, medicine, medecine, medical, science, sciences, insurance, reform, health care reform, obamacare, affordable " },
  { "tag": "Help the Homeless", "tag_slug": "help-the-homeless", "synonyms": "poverty, inequality, bed, roof, sleep, housing, shelter, shelters, homeless shelter, shelter, place to sleep" },
  { "tag": "Helping Refugees", "tag_slug": "refugees-in-america", "synonyms": "islamophobia, refugee, refugee camps, Sudan, humantarian crises, flee, escape, Brexit, crisis, home, shelter, camp" },
  { "tag": "Homeless Shelters", "tag_slug": "homeless-shelters-2", "synonyms": "shelter, camp, homeless, poor, poverty, durgs" },
  { "tag": "Immigrant Rights", "tag_slug": "immigrant-rights", "synonyms": "islamophobia, welcoming, flee, escape, immigrant, immigration, rights, right " },
  { "tag": "Mental Health", "tag_slug": "mental-health", "synonyms": "mental disorders, mental health, mental, disorder, stigma, mind, psych, Depression, anxiety, Stress, personality disorder, dementia, bipolar, bipolar disorder, Alzheimers'" },
  { "tag": "Minority Rights", "tag_slug": "minority-rights-2", "synonyms": "minorities, minority, black rights, black lives matter, diversity, inclusion, inclusive, civil rights" },
  { "tag": "Natural Resources Conservation & Protection", "tag_slug": "natural-resources-conservation-protection-2", "synonyms": "green energy, renewable energy, greenhouse gases, Greenhouse, environmentalism, Eco-friendly, eco friendly, sustainable, carbon footprint, footprint, rising sea levels, rising, oceans, air, wind, carbon, oil, global warming, climate, Natural, conservation, marine, forest, conserve, energy, reusable, pollution, polluted, Pollute, drought, droughts, deforestation, sustainability, climate change, natural disaster, clean air, clean water, clean energy" },
  { "tag": "Stop Gun Violence", "tag_slug": "stop-gun-violence", "synonyms": "gun, gun violence, violence, firearms, fire arms, gangs, gang, gang violence" },
  { "tag": "Suicide Prevention", "tag_slug": "suicide-prevention", "synonyms": "depression, suicidal, therapy, kill themselves, loneliness" },
  { "tag": "Teaching Tolerance, Fighting Hate", "tag_slug": "teaching-tolerance-fighting-hate", "synonyms": "tolerant, understanding, islamophobia, tolerance" },
  { "tag": "Violence Prevention", "tag_slug": "violence-prevention", "synonyms": "domestic violence, gang, gun" },
  { "tag": "Women's Rights", "tag_slug": "women-s-rights-2", "synonyms": "women, Sexual assault, assault, domestic violence, domestic, gender, gender discrimination, rape, women and STEM, STEM opportunities, women in tech, men" },
  { "tag": "Youth Centers & Clubs", "tag_slug": "youth-centers-clubs-2", "synonyms": "YMCA, Children, kids, afterschool, Boys, girls, students, youth, youths, community centers, community, extracurricular" }];

  // splits synonyms into array
  for (var i = 0; i < tagArr.length; i++) {
    tagArr[i].synonyms = tagArr[i].synonyms.split(', ');
  }
  // 

  var j = {
    input: req.params.input,
    tag: "",
    tag_slug: "",
    valid: 0
  };

  var idx = lunr(function () {
    this.field('tag');
    this.ref('tag_slug');
    this.field('synonyms');

    for (var i = 0; i < tagArr.length; i++) {
      this.add(tagArr[i]);
    }
  });

  var results = idx.search(req.params.input + '~1 *' + req.params.input + ' ' + req.params.input + '*')
  if (results.length !== 0) {
    j.tag = results[0].tag;
    j.tag_slug = results[0].ref;
    j.valid = 1;
  }
  res.send(JSON.stringify(j));
});

app.get('/pocket/:tag', function (req, res) {
  var j = {
    source: "",
    date: "",
    title: "",
    summary: "",
    image: "",
    url: "",
    valid: 0
  }
  request('https://getpocket.com/explore/' + req.params.tag, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      if($('div').hasClass('empty_state')) {
        res.send(JSON.stringify(j));
      }
        var content = $('#trending_list article.item_article div.item_content').first();
        j.source = $('cite.domain a', content).text();
        j.date = $('cite.domain span.read_time', content).text();
        j.title = $('h3.title', content).text();
        j.image = $('article.item_article div.item_image').attr('data-thumburl');
        j.url = $('h3.title a').attr('data-saveurl');
        j.summary = $('p.excerpt', content).text()
        res.send(JSON.stringify(j))
    }
  });
});

app.use('/orgs', OrgController);

module.exports = app;