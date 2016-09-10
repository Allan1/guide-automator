#! /usr/bin/env node
var fs = require("fs");
var path = require("path");
var showdown = require('showdown');
var gm = require('gm').subClass({imageMagick: true});
var wkhtmltopdf = require('wkhtmltopdf');
var input, output, imgOutDir;
var outputHTMLFile = 'manual.html';
var outputPDFFile = 'manual.pdf';
var DEFAULT_IMG_WIDTH = '60%';
var cmdsDictionary = ['get','click','takeScreenshot','scrollTo','takeScreenshotOf','fillIn','submit','wait','sleep','clickByLinkText']
var imgCount = imgCountSel = 0;
var seleniumBlocks= new Array();
var markdownText = '';
var converter = new showdown.Converter({parseImgDimensions:true});
var html_start = '<!DOCTYPE html><html lang="en"><head><title></title><meta charset="UTF-8"></head><body>';
var html_end = '</body></html>';
var html_pagebreak = '<div style="page-break-after: always;"></div>';
var outline_style = 'solid red 3px';
// var outline_style = 'solid rgba(0,0,0,0.8) 2000px';
var wkhtmltopdf_options = { 
	pageSize: 'letter', 
	output: null, 
	toc: true,
	tocHeaderText: 'Índice',
	footerRight: "[page]"
};

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
wkhtmltopdf_options.output = process.argv[3]+'/'+outputPDFFile;

imgOutDir = path.join(process.argv[3],'/img/');
// console.log(imgOutDir)

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
						takeScreenshot(cmds[i],cb);
						break;
					case 'takeScreenshotOf':
						takeScreenshotOf(cmds[i],cb);
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
					case 'clickByLinkText':
						driver.findElement(By.linkText(cmds[i].params[0])).click();
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
						var cmd = cmds[i];
						if (cmd.params.length > 1) {
 							timeout = cmd.params[1];
 						}
 						else{
 							timeout = 5000;
 						}
						driver.wait(until.elementLocated(By.css(cmd.params[0])), timeout);
						break;
					default:
						break;
				}
			}
		}
		return cb(null);
	});
}

function replaceBlockWithImage(blockIndex, filename, width) {
	var index = 0;
	markdownText = markdownText.replace(/<replaceSelenium>/g,function (match) {
		index++;
		if( (index-1) === blockIndex ) {
			return '<replaceSelenium>![]('+filename+' ='+width+'x*)';
		}
		return match;
	});
}

function takeScreenshot(cmd,cb) {
	imgCount++;
	var width = DEFAULT_IMG_WIDTH;
	if (cmd.params.length > 1) {
		width = cmd.params[1];
	}
	
	replaceBlockWithImage(cmd.blockIndex,imgCount+'.png',width);

	driver.takeScreenshot().then(
	  function(image, err) {
	  	imgCountSel++;
	  	if (err) { return cb(err);}
	  	else{
				fs.writeFile(output+'/'+imgCountSel+'.png', image, 'base64',function (err) {
					if (err) { return cb(err);}
				});	  		
	    }
	  }
	);
}

function takeScreenshotOf(cmd,cb) {
	imgCount++;
	var width = DEFAULT_IMG_WIDTH;
	var crop = false;
	var outline = false;
	var cssSelector = null;
	if (!cmd.params.length) {
		console.log("Missing param for takeScreenshotOf")
		return cb(null);
	}
	else{
		cssSelector = cmd.params[0];
	}

	if (cmd.params.length > 1) {
		crop = parseInt(cmd.params[1])
	}
	if (cmd.params.length > 2) {
		outline = parseInt(cmd.params[2])
	}
	if (cmd.params.length > 3) {
		width = cmd.params[3];
	}

	replaceBlockWithImage(cmd.blockIndex,imgCount+'.png',width);
	driver.findElement(By.css(cssSelector)).then(function(el) {
		if (outline) {
			driver.executeScript("arguments[0].style.outline = '"+outline_style+"'",el);
  	}
		driver.executeScript("return arguments[0].getBoundingClientRect()",el).then(function (rect) {
			driver.takeScreenshot().then(
		    function(image, err) {		    	
		    	driver.executeScript("arguments[0].style.outline = ''",el);
		    	imgCountSel++;
					if (crop) {
						var img = new Buffer(image, 'base64');
			    	gm(img)
			    		.crop(rect.width,rect.height,rect.left, rect.top)
			    		.write(output+'/'+imgCountSel+'.png',function (err) {
			    			if (err) {return cb(err);}
			    		});											
					}
					else{
						fs.writeFile(output+'/'+imgCountSel+'.png', image, 'base64',function (err) {
							if (err) { return cb(err);}
						});
					}
		    }
			);
		})
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

function replaceRemainingBlocks(cb) {
	markdownText = markdownText.replace(/<replaceSelenium>/g,"").replace(/\\pagebreak/g,html_pagebreak);
	return cb(null,markdownText);
}

function clearAndExportFiles(cb) {
	replaceRemainingBlocks(function (err,outputMarkdown) {
		if (err) {return cb(err);}
		else {
			return exportFiles(outputMarkdown,cb);			
		}
	})
}

function exportFiles(text,cb) {
	var html = html_start+converter.makeHtml(text)+html_end;
	fs.writeFileSync(output+'/'+outputHTMLFile,html);

	return exportPDF(html,cb);
}

function exportPDF(html,cb) {
	var basePath = 'file:///'+path.resolve(output).replace(/\\/g,'/')+'/';
	html_full_path_imgs = html.replace(/img src="/g,function (match) {
		return match+basePath;
	});

	wkhtmltopdf(html_full_path_imgs, wkhtmltopdf_options, function (err, stream) {
	  if (err) return cb(err);
	  else { return cb(null);}
	});	
}