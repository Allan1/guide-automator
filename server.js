/* server.js */

var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// public folder to store assets
app.use(express.static(__dirname + '/public'));

// routes for app
app.get('/', function(req, res) {
  res.render('pad');
});
app.get('/(:id)', function(req, res) {
  res.render('pad');
});

// get sharejs dependencies
var sharejs = require('share');
require('mongodb');

// options for sharejs 
var options = {
  db: {type: 'mongo'},
};

// attach the express server to sharejs
sharejs.server.attach(app, options);

// webdriver
// var fs = require('fs');
// var webdriver = require('selenium-webdriver'),
//     By = require('selenium-webdriver').By,
//     until = require('selenium-webdriver').until;

// var driver = new webdriver.Builder()
//     .forBrowser('firefox')
//     .build();

// driver.get('http://www.google.com/ncr');
// driver.findElement(By.name('q')).sendKeys('webdriver');
// driver.findElement(By.name('btnG')).click();
// driver.wait(until.titleIs('webdriver - Google Search'), 4000);
// driver.takeScreenshot().then(function(data) {
//   name = 'ss.png';
//   var screenshotPath = 'public/';
//   fs.writeFileSync(screenshotPath + name, data, 'base64');
// });
// driver.quit();

// listen on port 8000 (for localhost) or the port defined for heroku
var port = process.env.PORT || 8000;
app.listen(port);
