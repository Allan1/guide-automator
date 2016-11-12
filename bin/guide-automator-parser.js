var options = {
	output: "",
	outlineStyle: "solid red 3px",
	legacy: false
};

module.exports = {
	guideAutomatorParser: guideAutomatorParser,
	defineOptions: defineOptions
};

var guideAutomator = require('./guide-automator-function');

var DEFAULT_IMG_WIDTH = '60%';
var seleniumBlocks = [];
var markdownText = '';
var html_pagebreak = '<div style="page-break-after: always;"></div>';

var cmdsDictionary = [
	'get',
	'click',
	'takeScreenshot',
	'scrollTo',
	'takeScreenshotOf',
	'fillIn',
	'submit',
	'wait',
	'sleep',
	'clickByLinkText'
];

function defineOptions(arg) {
	Object.keys(options).forEach(function(key) {
		options[key] = arg[key] || options[key];
	});
}

function replaceBlockWithImage(blockIndex, filename, width) {
	var index = 0;
	markdownText = markdownText.replace(/<replaceSelenium>/g, function(match) {
		index++;
		if ((index - 1) === blockIndex) {
			return '<replaceSelenium>![](' + filename + ' =' + width + 'x*)';
		}
		return match;
	});
}

function extractMarkdownAndSelenium(markdownAndCode, cb) {
	var rePattern = /<automator>([\s\S]+?)<\/automator>/g;
	markdownText = markdownAndCode.replace(rePattern, function(match, p1, offset, string) {
		p1 = p1.replace(/\r?\n|\r/g, '');
		seleniumBlocks.push(p1);
		return '<replaceSelenium>';
	});
	return cb(seleniumBlocks);
}

function compile(seleniumBlocks, cb) {
	var cmds = [];
	var j = 0;
	for (var i = 0; i < seleniumBlocks.length; i++) {
		var tokens = seleniumBlocks[i].split(';');
		for (var o = 0; o < tokens.length; o++) {
			if (tokens[o] !== null && tokens[o] !== '') {
				var matches = tokens[o].trim().match(/^(\w+)(?:\(((?:\'.+\'|\d+)(?:,(?:\'.+\'|\d+))*)\))?$/);
				if (matches && (cmdsDictionary.indexOf(matches[1]) > -1)) { // IE9
					cmds[j] = {};
					cmds[j].cmd = matches[1];
					cmds[j].params = matches[2] ? matches[2].replace(/["']/g, "").split(',') : [];
					cmds[j].blockIndex = i;
					j++;
				} else {
					return cb("Invalid token: " + tokens[o]);
				}
			}
		}
	}
	return cb(null, cmds);
}

//-- Fim Tratamento dos blocos 'automator'-----

//-- Tratamento dos tokens ou execução de funcionalidades 'automator'  ------
function execSelenium(seleniumBlocks, cb) {
	var result;
	return compile(seleniumBlocks, function(err, cmds) {
		if (err) {
			return cb(err);
		} else {
			for (var i = 0; i < cmds.length; i++) {
				switch (cmds[i].cmd) {
					case 'get':
						guideAutomator.get(cmds[i].params[0]);
						break;
					case 'takeScreenshot':
						width = cmds[i].params[0] || DEFAULT_IMG_WIDTH;
						screenShotName = guideAutomator.takeScreenshot();
						replaceBlockWithImage(cmds[i].blockIndex,
							screenShotName,
							width);
						break;
					case 'takeScreenshotOf':
						width = cmds[i].params[3] || DEFAULT_IMG_WIDTH;
						screenShotName = guideAutomator.takeScreenshotOf(
							cmds[i].params[0],
							cmds[i].params[1],
							cmds[i].params[2]
						);
						replaceBlockWithImage(cmds[i].blockIndex,
							screenShotName,
							width);
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
						guideAutomator.fillIn(cmds[i].params[0], cmds[i].params[1]);
						break;
					case 'submit':
						guideAutomator.submit(cmds[i].params[0]);
						break;
					case 'click':
						guideAutomator.click(cmds[i].params[0]);
						break;
					case 'clickByLinkText':
						guideAutomator.clickByLinkText(cmds[i].params[0]);
						break;
					case 'hover':
						// driver.findElement(By.css(cmds[i].params[0])).then(function(elem){
						// 	driver.actions().mouseMove(elem).perform();
						// 	driver.sleep(cmds[i].params[1]);
						// });
						break;
					case 'sleep':
						guideAutomator.sleep(cmds[i].params[0]);
						break;
					case 'wait':
						guideAutomator.wait(cmds[i].params[0], cmds[i].params[1]);
						break;
					default:
						break;
				}
			}
		}
		return cb(null);
	});
}

function replaceRemainingBlocks(cb) {
	markdownText = markdownText.replace(/<replaceSelenium>/g, "").replace(/\\pagebreak/g, html_pagebreak);
	return cb(markdownText);
}

function guideAutomatorParser(mdText, cb) {
	guideAutomator.defineOptions(options);
	if (options.legacy) {
		return extractMarkdownAndSelenium(mdText, function(seleniumBlocks) { //Extração dos blocos 'automator'
			return execSelenium(seleniumBlocks, function(err) { //Execução e tratamento dos tokens dos blocos 'automator'
				if (err) {
					return cb(null, err);
				} else {
					guideAutomator.quit().then(function() {
						return replaceRemainingBlocks(cb);
					});
				}
			});
		});
	} else {
		return extractJavascript(mdText, function(err, javascriptBlocks) {
			if (err)
				throw err;
			return executeJavascriptSelenium(javascriptBlocks, function(err) {
				if (err)
					throw err;

				guideAutomator.quit().then(function() {
					return replaceRemainingBlocks(cb);
				});

			});
		});
	}
}
//-- Fim Tratamento dos tokens ou execução de funcionalidades 'automator' ------

//-- Tratamento via javascript
function replaceBlockWithJsStdout(blockIndex, jsStdout) {
	var index = 0;
	markdownText = markdownText.replace(/<replaceSelenium>/g, function(match) {
		index++;
		if ((index - 1) === blockIndex) {
			return '<replaceSelenium>' + jsStdout;
		}
		return match;
	});
}

function extractJavascript(markdownAndCode, cb) {
	var rePattern = /```javascript([\s\S]+?)```/g;
	markdownText = markdownAndCode.replace(rePattern, function(match, p1, offset, string) {
		seleniumBlocks.push(p1);
		return '<replaceSelenium>';
	});
	return cb(null, markdownText);
}

function executeJavascriptSelenium(markdownText, cb) {
	for (var n_block = 0; n_block < seleniumBlocks.length; n_block++) {
		guideAutomator.executeExternFunction(seleniumBlocks[n_block]);
		var jsStdout = guideAutomator.getReturn();
		replaceBlockWithJsStdout(n_block, jsStdout);
	}
	return cb(null);
}

//-- Fim tratamento via javascript
