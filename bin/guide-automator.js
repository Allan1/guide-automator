var fs = require("fs");
var gm = require('gm').subClass({
	imageMagick: true
});
var webdriver = require('selenium-webdriver'),
	By = require('selenium-webdriver').By,
	until = require('selenium-webdriver').until;
var driver = new webdriver.Builder()
	.forBrowser('chrome')
	.build();

var imgCount = 0;
var DEFAULT_IMG_WIDTH = '60%';
var seleniumBlocks = [];
var markdownText = '';
var html_pagebreak = '<div style="page-break-after: always;"></div>';

var options = {
	output: "",
	outlineStyle: "solid red 3px"
};
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

module.exports = {
	defineOptions: defineOptions,
	get: get,
	takeScreenshot: takeScreenshot,
	takeScreenshotOf: takeScreenshotOf,
	fillIn: fillIn,
	submit: submit,
	click: click,
	clickByLinkText: clickByLinkText,
	sleep: sleep,
	wait: wait,
	guideAutomatorParse: guideAutomatorParse
};


function defineOptions(arg) {
	Object.keys(options).forEach(function(key) {
		options[key] = arg[key] || options[key];
	});
}

/**
 * Acessa o site
 * @param  {string} url Site a ser acessado
 * @return {none}
 */
function get(url) {
	driver.get(url);
}

/**
 * Tira foto da parte visivel do site acessado
 * @return {string}   Nome da imagem gerada
 */
function takeScreenshot() {
	imgCount++;
	var localImageName = imgCount; //Tratamento devido procedimentos async

	driver.takeScreenshot().then(
		function(image, err) {
			if (err) {
				throw err;
			} else {
				fs.writeFile(options.output + '/' + localImageName + '.png', image, 'base64', function(err) {
					if (err) {
						throw err;
					}
				});
			}
		}
	);
	return imgCount + '.png';
}

/**
 * Tira foto do cssSelector passado, podendo dar crop ou highlight
 * @param  {string} cssSelector Css selector do DOM
 * @param  {int} crop        [Opicional] 1 - crop ativo, 0 - crop inativo
 * @param  {int} outline     [Opicional] 1 - outline ativo, 0 - outline inativo
 * @return {string}             Nome da imagem gerada
 */
function takeScreenshotOf(cssSelector, crop, outline) {
	imgCount++;
	var localImageName = imgCount; //Tratamento devido procedimentos async

	driver.findElement(By.css(cssSelector)).then(function(el) {
		if (parseInt(outline)) {
			driver.executeScript("arguments[0].style.outline = '" + options.outlineStyle + "'", el);
		}
		driver.executeScript("return arguments[0].getBoundingClientRect()", el).then(function(rect) {
			driver.takeScreenshot().then(
				function(image, err) {
					driver.executeScript("arguments[0].style.outline = ''", el);
					if (parseInt(crop)) {
						var img = new Buffer(image, 'base64');
						gm(img)
							.crop(rect.width, rect.height, rect.left, rect.top)
							.write(options.output + '/' + localImageName + '.png', function(err) {
								if (err) {
									throw err;
								}
							});
					} else {
						fs.writeFile(options.output + '/' + localImageName + '.png', image, 'base64', function(err) {
							if (err) {
								throw err;
							}
						});
					}
				}
			);
		});
	});
	return imgCount + '.png';
}

/**
 * Preenche infomações de um determinado campo
 * @param  {string} cssSelector css selector do DOM desejado
 * @param  {string} text        Texto que será escrito no campo
 * @return {none}
 */
function fillIn(cssSelector, text) {
	driver.findElement(By.css(cssSelector)).clear();
	driver.findElement(By.css(cssSelector)).sendKeys(text);
}

/**
 * Faz o submit no cssSelector
 * @param  {string} cssSelector css Selector do DOM desejado
 * @return {none}
 */
function submit(cssSelector) {
	driver.findElement(By.css(cssSelector)).submit();
}

/**
 * Clica em um determinado DOM
 * @param  {string} cssSelector css Selector do DOM desejado
 * @return {none}
 */
function click(cssSelector) {
	driver.findElement(By.css(cmds[i].params[0])).click();
}

/**
 * Clica em um determinado elemento utilizando o nome do linkText
 * @param  {string} text Texto a ser buscado nos links da interface
 * @return {none}
 */
function clickByLinkText(text) {
	driver.findElement(By.linkText(text)).click();
}

/**
 * Faz o driver parar por um tempo solicitado
 * @param  {int} sleepTime tempo em milisegundos para sleep
 * @return {none}
 */
function sleep(sleepTime) {
	driver.sleep(parseInt(sleepTime));
}

/**
 * Aguarda até um elemento da tela carregar ou até o limite de tempo
 * @param  {string} cssSelector css Selector do DOM desejado
 * @param  {int} timeOut     [Opicional]Tempo em milisegundo, default = 5000
 * @return {none}
 */
function wait(cssSelector, timeOut) {
	var timeLimit = timeOut || 5000;
	driver.wait(until.elementLocated(By.css(cssSelector)), timeLimit);
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
		p1 = p1.replace(/\r?\n|\r/g, ''); //TODO Verificar se isso que deu erro ao dar espaço/tab antes de chamar a função
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
				var matches = tokens[o].match(/^(\w+)(?:\(((?:\'.+\'|\d+)(?:,(?:\'.+\'|\d+))*)\))?$/);
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
						get(cmds[i].params[0]);
						break;
					case 'takeScreenshot':
						width = cmds[i].params[0] || DEFAULT_IMG_WIDTH;
						screenShotName = takeScreenshot();
						replaceBlockWithImage(cmds[i].blockIndex,
							screenShotName,
							width);
						break;
					case 'takeScreenshotOf':
						width = cmds[i].params[3] || DEFAULT_IMG_WIDTH;
						screenShotName = takeScreenshotOf(
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
						fillIn(cmds[i].params[0], cmds[i].params[1]);
						break;
					case 'submit':
						submit(cmds[i].params[0]);
						break;
					case 'click':
						click(cmds[i].params[0]);
						break;
					case 'clickByLinkText':
						clickByLinkText(cmds[i].params[0]);
						break;
					case 'hover':
						// driver.findElement(By.css(cmds[i].params[0])).then(function(elem){
						// 	driver.actions().mouseMove(elem).perform();
						// 	driver.sleep(cmds[i].params[1]);
						// });
						break;
					case 'sleep':
						sleep(cmds[i].params[0]);
						break;
					case 'wait':
						wait(cmds[i].params[0], cmds[i].params[1]);
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

function guideAutomatorParse(data, cb) {
	return extractMarkdownAndSelenium(data, function(seleniumBlocks) { //Extração dos blocos 'automator'
		return execSelenium(seleniumBlocks, function(err) { //Execução e tratamento dos tokens dos blocos 'automator'
			if (err) {
				return cb(null, err);
			} else {
				driver.quit().then(function() {
					return replaceRemainingBlocks(cb);
				});
			}
		});
	});
}
//-- Fim Tratamento dos tokens ou execução de funcionalidades 'automator' ------
