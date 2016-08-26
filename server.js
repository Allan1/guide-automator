#! /usr/bin/env node

var fs = require("fs");
var path = require("path");
var showdown = require('showdown');
var gm = require('gm').subClass({imageMagick: true});
var wkhtmltopdf = require('wkhtmltopdf');
var input, output, imgOutDir;
var outputHTMLFile = 'manual.html';
var outputPDFFile = 'manual.pdf';
var cmdsDictionary = ['get','click','takeScreenshot','scrollTo','takeScreenshotOf','fillIn','submit','wait','sleep']
var imgCount = imgCountSel = 0;
var seleniumBlocks= new Array();
var markdownText = '';
var converter = new showdown.Converter({parseImgDimensions:true});
var html_start = '<!DOCTYPE html><html lang="en"><head><title></title><meta charset="UTF-8"></head><body>';
var html_end = '</body></html>';
var html_pagebreak = '<div style="page-break-after: always;"></div>';
var outline_style = 'solid red 3px';
// var outline_style = 'solid rgba(0,0,0,0.8) 2000px';

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
imgOutDir = path.join(process.argv[3],'/img/');
console.log(imgOutDir)

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
	  				clearAndExportFiles(cb)
	  			});
	  		}
	  	});
	  });
	});
}

function extractMarkdownAndSelenium(markdownAndCode, cb){    
    var rePattern = /<automator>([\s\S]+?)<\/automator>/g;
    markdownText = markdownAndCode.replace(rePattern, function(match, p1, offset, string) {
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
 						imgCount++;
 						var index = 0;
 						var width = '60%';
 						if (cmd.params.length > 1) {
 							width = cmd.params[1];
 						}
 						markdownText = markdownText.replace(/<replaceSelenium>/g,function (match) {
 							index++;
		    			if( (index-1) === cmd.blockIndex ) {
	    					return '<replaceSelenium>![]('+imgCount+'.png ='+width+'x*)';
		    			}
							return match;
		    		});
 						driver.takeScreenshot().then(
					    function(image, err) {
					    	imgCountSel++;
					    	if (err) { return cb(err);}
					    	else{
					    		fs.stat(output+'/'+imgCountSel+'.png', function (err, stats) {
									  if (stats) {
									   	fs.unlinkSync(output+'/'+imgCountSel+'.png');
									  }
									  fs.writeFileSync(output+'/'+imgCountSel+'.png', image, 'base64');
									});
				        }
					    }
						);
						break;
					case 'takeScreenshotOf':
						var cmd = cmds[i];
 						imgCount++;
 						var index = 0;
 						var width = '60%';
 						if (!cmd.params.length) {
 							console.log("Missing param for takeScreenshotOf")
 							return cb(null);
 						}
 						if (cmd.params.length > 1) {
 							width = cmd.params[1];
 						}

 						markdownText = markdownText.replace(/<replaceSelenium>/g,function (match) {
 							index++;
		    			if( (index-1) === cmd.blockIndex ) {
	    					return '<replaceSelenium>![]('+imgCount+'.png ='+width+'x*)';
		    			}
							return match;
		    		});
						driver.findElement(By.css(cmds[i].params[0])).then(function(el) {
							driver.executeScript("arguments[0].style.outline = '"+outline_style+"'",el);
							driver.executeScript("return arguments[0].getBoundingClientRect()",el).then(function (rect) {
								driver.takeScreenshot().then(
							    function(image, err) {
							    	driver.executeScript("arguments[0].style.outline = ''",el);
							    	imgCountSel++;
							    	fs.stat(output+'/'+imgCountSel+'.png', function (err, stats) {
										  if (stats) {
										   	fs.unlinkSync(output+'/'+imgCountSel+'.png');
										  }
										});
										var img = new Buffer(image, 'base64');
							    	gm(img)
							    		.crop(rect.width,rect.height,rect.left, rect.top)
							    		.write(output+'/'+imgCountSel+'.png',function (err) {
							    			if (err)
							    				return cb(err);
							    		});
							    }
								);
							})
					 	});
						break;
					case 'scrollTo':
						// driver.findElement(By.css(cmds[i].params[0])).then(function(el) {
						// 	el.getLocation().then(function (position) {
						// 		driver.touchActions().scroll({x:position.x,y:position.y}).perform();
						// 	})
					 // 	});
						break;
					case 'getText':
						// var text = driver.findElement(By.css(cmds[i].params[0])).getText();
						break;
					case 'fillIn':
						driver.findElement(By.css(cmds[i].params[0])).clear();
						driver.findElement(By.css(cmds[i].params[0])).sendKeys(cmds[i].params[1]);
						break;
					case 'submit':
						driver.findElement(By.css(cmds[i].params[0])).submit();
						break;
					case 'click':
						driver.findElement(By.css(cmds[i].params[0])).click();
						break;
					case 'hover':
						// driver.findElement(By.css(cmds[i].params[0])).then(function(elem){
						// 	driver.actions().mouseMove(elem).perform();
						// 	driver.sleep(cmds[i].params[1]);
						// });
						break;
					case 'sleep':
						driver.sleep(parseInt(cmds[i].params[0]));
						break;
					case 'wait':
						if (cmd.params.length > 1) {
 							timeout = cmd.params[1];
 						}
 						else
 							timeout = 10000;
						driver.wait(until.elementLocated(By.id(cmds[i].params[0])), timeout);
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
				var matches = tokens[o].match(/^(\w+)(?:\(((?:\'.+\'|\d+)(?:,(?:\'.+\'|\d+))*)\))?$/)
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

function clearAndExportFiles(cb) {
	fs.stat(output+'/'+outputPDFFile, function (err, stats) {
	  if (stats) {
	   	fs.unlinkSync(output+'/'+outputPDFFile);
	  }
	});
	return exportFiles(markdownText.replace(/<replaceSelenium>/g,"").replace(/\\pagebreak/g,html_pagebreak),cb);
}

function exportFiles(text,cb) {
	
	var html = html_start+converter.makeHtml(text)+html_end;
	
	var basePath = 'file:///'+path.resolve(output).replace(/\\/g,'/')+'/';

	// output pdf with wkhtmltopdf
	html_full_path_imgs = html.replace(/img src="/g,function (match) {
		return match+basePath;
	});

	wkhtmltopdf(html_full_path_imgs, { pageSize: 'letter', output: output+'/'+'out.pdf', toc: true }, function (err, stream) {
	  if (err) return cb(err);
	});
	
	// output html
	fs.writeFileSync(output+'/'+outputHTMLFile,html);


	return cb(null);
}
