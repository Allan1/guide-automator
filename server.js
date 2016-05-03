var express = require('express');
var app = express();
var fs = require("fs");
var input, output;
var showdown = require('showdown');
var outputHTMLFile = 'manual.html';
var cmdsDictionary = ['get','click','takeScreenshot','inputText']

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
	  // console.log('processInput');
	  if (err) { return cb(err);}
	  extractMarkdownAndSelenium(data,function (html,seleniumBlocks) {
	  	// console.log(html);
	  	fs.writeFile(output+'/'+outputHTMLFile,html,function (err) {
	  		if (err) { return cb(err);}
	  	});
	  	execSelenium(seleniumBlocks,cb);
	  });
	});
}

function extractMarkdownAndSelenium(markdownAndCode, cb){
    // console.log('extractMarkdownAndSelenium');
    var converter = new showdown.Converter();
    var rePattern = /<selenium>([\s\S]+?)<\/selenium>/g;
    // var seleniumCode="";
    var seleniumBlocks= new Array();
    // console.log(markdownAndCode)
    var markdownText = markdownAndCode.replace(rePattern, function(match, p1, offset, string) {
        // console.log(p1);
        p1 = p1.replace(/\r?\n|\r/g,'');

        // var tmp = document.createElement("DIV");
        // tmp.innerHTML = p1;
        // p1 = tmp.textContent || tmp.innerText || "";
        // seleniumCode = seleniumCode.concat(p1);
        seleniumBlocks.push(p1);
        // console.log(p1,offset);
        // console.log('concat',seleniumCode);
      return p1;
    });
    
    var html = converter.makeHtml(markdownText);
    return cb(html,seleniumBlocks);
}

function execSelenium(seleniumBlocks,cb) {
	// console.log('execSelenium')
	var webdriver = require('selenium-webdriver'),
	    By = require('selenium-webdriver').By,
	    until = require('selenium-webdriver').until;

	var driver = new webdriver.Builder()
	    .forBrowser('firefox')
	    .build();

	// eval(seleniumCode);
	// console.log(seleniumCode)
	compile(seleniumBlocks,function (err,cmds) {
		if (err) {
			console.log('err',err)
		}
		else{
			console.log(cmds)
			for (var i = 0; i < cmds.length; i++) {
				console.log(cmds[i])
				var cmd = cmds[i][0];
				var params = cmds[i][1];
				switch(cmd) {
					case 'get':
						driver.get(params[0]);
						break;
					case 'takeScreenshot':
						break;
					default:
						break;
				}
			}
		}
	});
	return cb(null);
}

function compile(seleniumBlocks, cb) {
	console.log('compile')
	var cmds = [];
	for (var i = 0; i < seleniumBlocks.length; i++) {
		var tokens = seleniumBlocks[i].split('##');
		var j = 0;
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i]!=null && tokens[i]!='') {
				var matches = tokens[i].match(/^(\w+)(?:=\[((?:\'\S+\'|\d+)(?:,(?:\'\S+\'|\d+))*)\])?$/)
				if (matches && (cmdsDictionary.indexOf(matches[1]) > -1)) { // IE9
					cmds[j] = [];
					cmds[j][0] = matches[1];
					cmds[j][1] = matches[2]? matches[2].replace(/["']/g, "").split(',') : [];
					for (var k = 0; k < cmds[j][1].length; k++) {
					}
					j++;
				}
				else {
					return cb("Invalid token: "+tokens[i])
				}

			}
		}
	}
	return cb(null,cmds);
}

