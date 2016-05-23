#! /usr/bin/env node

var fs = require("fs");
var path = require("path");
var input, output;
var showdown = require('showdown');
var pdf = require('html-pdf');
var outputHTMLFile = 'manual.html';
var outputPDFFile = 'manual.pdf';
var cmdsDictionary = ['get','click','takeScreenshot','inputText','findElement','scrollTo','takeScreenshotOf','fillIn','submit']
var imageCount = 0;
var seleniumBlocks= new Array();
var markdownText = '';

var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;

var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

exports.printMsg = function() {
  console.log("This is a message from the demo package");
}

if (!process.argv[2]) {
	console.log('Input file missing')
	process.exit();
}
input = process.argv[2];

if (!process.argv[3]) {
	console.log('Output folder missing')
	process.exit();
}
output = process.argv[3];

fs.stat(input,function(err,stats){
	if (err) {
		console.log('Input is not a file')
		process.exit();
	}
});

fs.stat(output,function(err,stats){
	if (err) {
		console.log('Output is not a folder')
		process.exit();
	}
});

processInput(input,function (err) {
	if (err) { throw err;}
});

function processInput(input, cb) {
	fs.readFile(input, 'utf8', (err, data) => {
	  if (err) { return cb(err);}
	  return extractMarkdownAndSelenium(data,function (seleniumBlocks) {

	  	return execSelenium(seleniumBlocks,function (err) {
	  		if (err) { return cb(err);}
	  		else{
	  			driver.quit().then(function () {
	  				exportFiles(cb)
	  			});
	  		}
	  	});
	  });
	});
}

function extractMarkdownAndSelenium(markdownAndCode, cb){    
    var rePattern = /<automator>([\s\S]+?)<\/automator>/g;
    markdownText = markdownAndCode.replace(rePattern, function(match, p1, offset, string) {
    	// console.log(match.split(/\r\n|\r|\n/).length,p1,offset)
        p1 = p1.replace(/\r?\n|\r/g,'');
        seleniumBlocks.push(p1);
      	return '<replaceSelenium>';
    });
    return cb(seleniumBlocks);
}

function execSelenium(seleniumBlocks,cb) {	
	return compile(seleniumBlocks,function (err,cmds) {
		if (err) { return cb(err);}
		else{
			for (var i = 0; i < cmds.length; i++) {
				switch(cmds[i].cmd) {
					case 'get':
						driver.get(cmds[i].params[0]);
						break;
					case 'takeScreenshot':
						var cmd = cmds[i];
 						var index = 0;
 						markdownText = markdownText.replace(/<replaceSelenium>/g,function (match) {
	    				if( index === cmd.blockIndex ) {
		    				imageCount++;
	    					return '![Alt text]('+imageCount+'.png)';
		    			}
		    			index++;
							return match;
		    		});
						driver.takeScreenshot().then(
					    function(image, err) {
					    	if (err) { return cb(err);}
					    	else{
				        	fs.writeFile(output+'/'+imageCount+'.png', image, 'base64', function(err) {
			            	if (err) { return cb(err);}
						    	});
				        }
					    }
						);
						break;
					case 'takeScreenshotOf':
						var cmd = cmds[i];
 						var index = 0;
 						markdownText = markdownText.replace(/<replaceSelenium>/g,function (match) {
		    			if( index === cmd.blockIndex ) {
	    					imageCount++;
		    				return '![Alt text]('+imageCount+'.png)';
		    			}
		    			index++;
							return match;
		    		});
						driver.findElement(By.css(cmds[i].params[0])).then(function(el) {
			    		el.getLocation().then(function (position) {
			    			driver.touchActions().scroll({x:-3000,y:-3000}).scroll({x:position.x,y:position.y}).perform();
								driver.takeScreenshot().then(
							    function(image, err) {
							    	if (err) { return cb(err);}
							    	else{
						        	fs.writeFile(output+'/'+imageCount+'.png', image, 'base64', function(err) {
					            	if (err) { return cb(err);}
						        	});
						        }
							    }
								);
							})
					 	});
						break;
					case 'findElement':
						driver.findElement(By.css(cmds[i].params[0])).then(function(el) {
							
					 	});
						break;
					case 'scrollTo':
						console.log('scrollTo')
						// driver.findElement(By.css(cmds[i].params[0])).then(function(el) {
						// 	el.getLocation().then(function (position) {
						// 		driver.touchActions().scroll({x:position.x,y:position.y}).perform();
						// 	})
					 // 	});
						break;
					case 'getText':
						var text = driver.findElement(By.css(cmds[i].params[0])).getText();
						break;
					case 'fillIn':
						driver.findElement(By.css(cmds[i].params[0])).sendKeys(cmds[i].params[1]);
						break;
					case 'submit':
						driver.findElement(By.css(cmds[i].params[0])).submit();
						break;
					case 'hover':
						driver.findElement(By.css(cmds[i].params[0])).then(function(elem){
							driver.actions().mouseMove(elem).perform();
							driver.sleep(cmds[i].params[1]);
						});
						break;
					default:
						break;
				}
			}
		}
		return cb(null);
	});
}

function compile(seleniumBlocks, cb) {
	var cmds = [];
	var j = 0;
	for (var i = 0; i < seleniumBlocks.length; i++) {
		var tokens = seleniumBlocks[i].split(';');
		for (var o = 0; o < tokens.length; o++) {
			if (tokens[o]!=null && tokens[o]!='') {
				var matches = tokens[o].match(/^(\w+)(?:\(((?:\'\S+\'|\d+)(?:,(?:\'\S+\'|\d+))*)\))?$/)
				if (matches && (cmdsDictionary.indexOf(matches[1]) > -1)) { // IE9
					cmds[j] = {};
					cmds[j].cmd = matches[1];
					cmds[j].params = matches[2]? matches[2].replace(/["']/g, "").split(',') : [];
					cmds[j].blockIndex = i;
					j++;
				}
				else {
					return cb("Invalid token: "+tokens[o])
				}
			}
		}
	}
	return cb(null,cmds);
}

function exportFiles(cb) {
	fs.stat(output+'/'+outputPDFFile, function (err, stats) {
	  if (stats) {
	   	fs.unlinkSync(output+'/'+outputPDFFile);
	  }
	});
	var converter = new showdown.Converter();
	markdownText = markdownText.replace("<replaceSelenium>","");
	var html = converter.makeHtml(markdownText);
	
	var options = { 
		base: 'file:///'+path.resolve(output).replace(/\\/g,'/')+'/', 
		format: 'A4',
		quality: '100'
	};	 
	pdf.create(html, options).toFile(output+'/'+outputPDFFile, function(err, res) {
	  if (err) return cb(err);
	});
		
	fs.writeFile(output+'/'+outputHTMLFile,html,function (err) {
		if (err) { return cb(err);}
	});
	return cb(null);
}
