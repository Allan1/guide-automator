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

var DEFAULT_IMG_WIDTH = '60%';
var imgCount = 0;
var returnGuideAutomator = "";

var GLOBAL = {};
var options = {
	output: "",
	outlineStyle: "solid red 3px",
	legacy: false,
	debug: false
};

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
	quit: quit,
	getReturn: getReturn,
	executeExternFunction: executeExternFunction
};

function setReturn(msg) {
	returnGuideAutomator += "\n" + msg + "\n";
}
/**
 * Print text on manual
 * @param {string}
 */
console.print = setReturn;

//Internal function to eval external code
function executeExternFunction(ExternFunction) {
	var res = eval(ExternFunction);
}

function getReturn() {
	var aux = returnGuideAutomator;
	returnGuideAutomator = "";
	return aux;
}

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
function takeScreenshot(width) {
	imgCount++;
	width = width || DEFAULT_IMG_WIDTH;
	var localImageName = imgCount; //Tratamento devido procedimentos async

	if (options.debug)
		console.time("Screenshot " + localImageName);

	driver.takeScreenshot().then(
		function(image, err) {
			if (err) {
				throw err;
			} else {
				fs.writeFile(options.output + '/' + localImageName + '.png', image, 'base64', function(err) {
					if (err)
						throw err;

					if (options.debug)
						console.timeEnd("Screenshot " + localImageName);
				});
			}
		}
	);
	if (options.legacy)
		return imgCount + '.png';
	else {
		setReturn('![](' + imgCount + '.png =' + width + 'x*)');
	}
}

/**
 * Tira foto do cssSelector passado, podendo dar crop ou highlight
 * @param  {string} cssSelector Css selector do DOM
 * @param  {int} crop        [Opicional] 1 - crop ativo, 0 - crop inativo
 * @param  {int} outline     [Opicional] 1 - outline ativo, 0 - outline inativo
 * @return {string}             Nome da imagem gerada
 */
function takeScreenshotOf(cssSelector, crop, outline, width) {
	if (options.legacy) {
		crop = parseInt(crop) == 1;
		outline = parseInt(outline) == 1;
	}

	imgCount++;
	width = width || DEFAULT_IMG_WIDTH;
	var localImageName = imgCount; //Tratamento devido procedimentos async

	if (options.debug)
		console.time("ScreenshotOF " + localImageName);

	driver.findElement(By.css(cssSelector)).then(function(el) {
		if (outline) {
			driver.executeScript("arguments[0].style.outline = '" + options.outlineStyle + "'", el);
		}
		driver.executeScript("arguments[0].scrollIntoView()", el);
		driver.executeScript("return arguments[0].getBoundingClientRect()", el).then(function(rect) {
			driver.takeScreenshot().then(
				function(image, err) {
					driver.executeScript("arguments[0].style.outline = ''", el);
					if (crop) {
						var img = new Buffer(image, 'base64');
						gm(img)
							.crop(rect.width, rect.height, rect.left, rect.top)
							.write(options.output + '/' + localImageName + '.png', function(err) {
								if (err)
									throw err;

								if (options.debug)
									console.timeEnd("ScreenshotOF " + localImageName);
							});
					} else {
						fs.writeFile(options.output + '/' + localImageName + '.png', image, 'base64', function(err) {
							if (err)
								throw err;

							if (options.debug)
								console.timeEnd("ScreenshotOF " + localImageName);
						});
					}
				}
			);
		});
	});
	if (options.legacy)
		return imgCount + '.png';
	else {
		setReturn('![](' + imgCount + '.png =' + width + 'x*)');
	}
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

function getText(cssSelector) {
	var textResult = "";
	/*
	// Need to fix Async's call
	driver.findElement(By.css(cssSelector)).getText()
		.then(function(text) {
			textResult = text;
		});
	*/

	return textResult;
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
	driver.findElement(By.css(cssSelector)).click();
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

function quit() {
	return driver.quit();
}
