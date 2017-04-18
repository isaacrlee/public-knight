const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const fs = require('fs')
const jsonfile = require('jsonfile')

const app = express()

const file = 'knight.json'
let orgs;
jsonfile.readFile(file, function (err, data) {
  orgs = data
})

let headers = []
for (let i = 0; i < orgs.length; i++) {
  if (orgs[i]['header_image_url'] != null) {
    headers.push(orgs[i])
  }
}

let images = []
for (let i = 0; i < headers.length; i++) {
  request(headers[i]['header_image_url'], { encoding: 'binary' }, function (error, response, body) {
    images.push[body]
  });
}

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (request, response) => {
  response.render('home', {
    data: orgs
  })
})

app.get('/json', (request, response) => {
  response.send(orgs)
})

app.get('/headers', (request, response) => {
  response.render('home', {
    headers: headers,
    images: images
  })
})

app.listen(process.env.PORT || 5000)