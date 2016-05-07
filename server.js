var express = require('express');
var app = express();
var fs = require("fs");
var async = require("async");
var input, output;
var showdown = require('showdown');
var outputHTMLFile = 'manual.html';
var cmdsDictionary = ['get','click','takeScreenshot','inputText']
var imageCount = 0;
var seleniumBlocks= new Array();
var markdownText = '';

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
	  console.log('processInput');
	  if (err) { return cb(err);}
	  return extractMarkdownAndSelenium(data,function (seleniumBlocks) {

	  	return execSelenium(seleniumBlocks,function (err) {
	  		if (err) { return cb(err);}
	  		else{
	  			return makeHtml(cb);
	  		}
	  	});
	  });
	});
}

function extractMarkdownAndSelenium(markdownAndCode, cb){
    console.log('extractMarkdownAndSelenium');
    
    var rePattern = /<selenium>([\s\S]+?)<\/selenium>/g;
    markdownText = markdownAndCode.replace(rePattern, function(match, p1, offset, string) {
        p1 = p1.replace(/\r?\n|\r/g,'');
		// var tmp = document.createElement("DIV");
        // tmp.innerHTML = p1;
        // p1 = tmp.textContent || tmp.innerText || "";
        // seleniumCode = seleniumCode.concat(p1);
        seleniumBlocks.push(p1);
      	return '<replaceSelenium>';
    });
    // console.log(markdownText)
    return cb(seleniumBlocks);
}

function execSelenium(seleniumBlocks,cb) {
	console.log('execSelenium')
	var webdriver = require('selenium-webdriver'),
	    By = require('selenium-webdriver').By,
	    until = require('selenium-webdriver').until;

	var driver = new webdriver.Builder()
	    .forBrowser('firefox')
	    .build();
	
	return compile(seleniumBlocks,function (err,cmds) {
		if (err) { return cb(err);}
		else{
			// var i = 0;
			// async.whilst(
			// 	function () { return i < cmds.length; },
			// 	function (callback) {
			// 		console.log('i:',i);
			// 		switch(cmds[i].cmd) {
			// 			case 'get':
			// 				console.log('get')
			// 				driver.get(cmds[i].params[0]);
			// 				break;
			// 			case 'takeScreenshot':
			// 				console.log('takeScreenshot')
	  //   					var cmd = cmds[i];
			// 				// driver.takeScreenshot().then(
			// 				//     function(image, err) {
			// 				//     	if (err) { return cb(err);}
			// 				//     	else{
			// 				//     		imageCount++;
			// 				//         	fs.writeFile(output+'/'+imageCount+'.png', image, 'base64', function(err) {
			// 				//             	if (err) { return cb(err);}
			// 				// 		    	else{
			// 				// 					console.log('takeScreenshot',markdownText)
			// 				// 		    		var index = 0;
			// 				// 		    		markdownText = markdownText.replace(/<replaceSelenium>/g,function (match) {
			// 				// 	    				// console.log(index,cmd.blockIndex)
			// 				// 		    			if( index === cmd.blockIndex ) {
			// 				// 		    				// console.log('![Alt text]('+imageCount+'.png)')
			// 				// 		    				return '![Alt text]('+imageCount+'.png)';
			// 				// 		    			}
			// 				// 		    			index++;
	  //     					// 		  				return match;
			// 				// 		    		});
			// 				// 		    	}
			// 				//         	});
			// 				//         }
			// 				//     }
			// 				// );
			// 				break;
			// 			default:
			// 				break;
			// 		}
			// 		i++;
			// 		callback(null, i);
			// 	},
			// 	function (err, n) {
			//     	console.log('err',err)
			//     }
			// );

			// var x = 0;
			// var loopArray = function(cmds) {
			//     execCmd(cmds[x],function(){
			//         // set x to next item
			//         x++;

			//         // any more items in array? continue loop
			//         if(x < cmds.length) {
			//             loopArray(cmds);   
			//         }
			//     }); 
			// }
			// function execCmd(cmd,callback) {
			//     console.log(cmd);
		 //    	switch(cmd.cmd) {
			// 		case 'get':
			// 			console.log('get')
			// 			driver.get(cmd.params[0]);
			// 			break;
			// 		case 'takeScreenshot':
			// 			console.log('takeScreenshot')
   // 						// var cmd = cmds[i];
   // 						driver.wait(function() {
			// 				return driver.takeScreenshot().then(
			// 				    function(image, err) {
			// 				    	if (err) { return cb(err);}
			// 				    	else{
			// 				    		imageCount++;
			// 				        	fs.writeFile(output+'/'+imageCount+'.png', image, 'base64', function(err) {
			// 				            	if (err) { return cb(err);}
			// 						    	else{
			// 									console.log('takeScreenshot',markdownText)
			// 						    		var index = 0;
			// 						    		markdownText = markdownText.replace(/<replaceSelenium>/g,function (match) {
			// 					    				// console.log(index,cmd.blockIndex)
			// 						    			if( index === cmd.blockIndex ) {
			// 						    				// console.log('![Alt text]('+imageCount+'.png)')
			// 						    				return '![Alt text]('+imageCount+'.png)';
			// 						    			}
			// 						    			index++;
	  //  												return match;
			// 						    		});
			// 						    	}
			// 				        	});
			// 				        }
			// 				    }
			// 				);   							
   // 						});
			// 			break;
			// 		default:
			// 			break;
			// 	}

			//     callback();
			// }
			// loopArray(cmds);
			
			for (var i = 0; i < cmds.length; i++) {
				switch(cmds[i].cmd) {
					case 'get':
						console.log('get')
						driver.get(cmds[i].params[0]);
						break;
					case 'takeScreenshot':
						console.log('takeScreenshot')
   						var cmd = cmds[i];
   						markdownText = markdownText.replace(/<replaceSelenium>/g,function (match) {
		    				// console.log(index,cmd.blockIndex)
			    			if( index === cmd.blockIndex ) {
			    				// console.log('![Alt text]('+imageCount+'.png)')
			    				return '![Alt text]('+imageCount+'.png)';
			    			}
			    			index++;
								return match;
			    		});
						driver.takeScreenshot().then(
						    function(image, err) {
						    	if (err) { return cb(err);}
						    	else{
						    		imageCount++;
						        	fs.writeFile(output+'/'+imageCount+'.png', image, 'base64', function(err) {
						            	if (err) { return cb(err);}
								    	else{
											console.log('takeScreenshot',markdownText)
								    		var index = 0;
								    		
								    	}
						        	});
						        }
						    }
						);
						break;
					default:
						break;
				}
			}
		}
		return cb(null);
	});
	// return cb(null);
}

function compile(seleniumBlocks, cb) {
	console.log('compile')
	var cmds = [];
	for (var i = 0; i < seleniumBlocks.length; i++) {
		var tokens = seleniumBlocks[i].split('##');
		var j = 0;
		for (var o = 0; o < tokens.length; o++) {
			if (tokens[o]!=null && tokens[o]!='') {
				var matches = tokens[o].match(/^(\w+)(?:=\[((?:\'\S+\'|\d+)(?:,(?:\'\S+\'|\d+))*)\])?$/)
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

function makeHtml(cb) {
	var converter = new showdown.Converter();
	console.log('last',markdownText)
	// markdownText = markdownText.replace("<replaceSelenium>","");
	var html = converter.makeHtml(markdownText);
	fs.writeFile(output+'/'+outputHTMLFile,html,function (err) {
  		if (err) { return cb(err);}
  	});
  	return cb(null);
}
