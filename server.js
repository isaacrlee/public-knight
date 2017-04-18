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

app.listen(process.env.PORT || 5000)