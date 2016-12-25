var __fs = require("fs");
const {
	VM
} = require('vm2');
var __gm = require('gm').subClass({
	imageMagick: true
});
var __webdriver = require('selenium-webdriver'),
	__by = require('selenium-webdriver').By,
	__until = require('selenium-webdriver').until;
var __Driver = new __webdriver.Builder()
	.forBrowser('chrome')
	.build();

var __DEFAULT_IMG_WIDTH = '60%';
var __imgCount = 0;
var __returnGuideAutomator = "";

var GLOBAL = {};

var options = {
	output: "",
	outlineStyle: "solid red 3px",
	debug: false
};

var GD = {
	get driver() {
		return __Driver;
	},
	get until() {
		return __until;
	},
	get by() {
		return __by;
	}
};

module.exports = {
	defineOptions: defineOptions,
	getReturn: getReturn,
	quit: quit,
	executeExternFunction: executeExternFunction
};

var sandbox = {
	GD: GD,
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
	console: console
};

function setReturn(msg) {
	__returnGuideAutomator += "\n" + msg + "\n";
}
/**
 * Print text on manual
 * @param {string}
 */
console.print = setReturn;

//Internal function to eval external code
function executeExternFunction(ExternFunction) {
	const vm = new VM({
		sandbox: sandbox
	});
	var res = vm.run(ExternFunction);
}

function getReturn() {
	var aux = __returnGuideAutomator;
	__returnGuideAutomator = "";
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
	GD.driver.get(url);
}

/**
 * Tira foto da parte visivel do site acessado
 * @return {string}   Nome da imagem gerada
 */
function takeScreenshot(width) {
	__imgCount++;
	width = width || __DEFAULT_IMG_WIDTH;
	var localImageName = __imgCount; //Tratamento devido procedimentos async

	if(options.debug)
		console.time("Screenshot " + localImageName);

	GD.driver.takeScreenshot().then(
		function(image, err) {
			if(err) {
				throw err;
			} else {
				__fs.writeFile(options.output + '/' + localImageName + '.png', image, 'base64', function(err) {
					if(err)
						throw err;

					if(options.debug)
						console.timeEnd("Screenshot " + localImageName);
				});
			}
		}
	);
	setReturn('![](' + __imgCount + '.png =' + width + 'x*)');

}

/**
 * Tira foto do cssSelector passado, podendo dar crop ou highlight
 * @param  {string} cssSelector Css selector do DOM
 * @param  {int} crop        [Opicional] 1 - crop ativo, 0 - crop inativo
 * @param  {int} outline     [Opicional] 1 - outline ativo, 0 - outline inativo
 * @return {string}             Nome da imagem gerada
 */
function takeScreenshotOf(cssSelector, crop, outline, width) {
	var cssSelectors;
	if(cssSelector.constructor === Array) {
		cssSelectors = cssSelector;
		cssSelector = cssSelectors[0];
	}
	__imgCount++;
	width = width || __DEFAULT_IMG_WIDTH;
	var localImageName = __imgCount; //Tratamento devido procedimentos async

	if(options.debug)
		console.time("ScreenshotOF " + localImageName);

	GD.driver.findElement(GD.by.css(cssSelector)).then(function(el) {
		if(outline) {
			GD.driver.executeScript("arguments[0].style.outline = '" + options.outlineStyle + "'", el);
			if(cssSelectors) {
				cssSelectors.forEach(element => {
					GD.driver.findElement(GD.by.css(element)).then(function(el1) {
						GD.driver.executeScript("arguments[0].style.outline = '" + options.outlineStyle + "'", el1);
					});
				});
			}
		}
		GD.driver.executeScript("arguments[0].scrollIntoView()", el);
		GD.driver.executeScript("return arguments[0].getBoundingClientRect()", el).then(function(rect) {
			GD.driver.takeScreenshot().then(
				function(image, err) {
					if(outline) {
						GD.driver.executeScript("arguments[0].style.outline = ''", el);
						if(cssSelectors) {
							cssSelectors.forEach(element => {
								GD.driver.findElement(GD.by.css(element)).then(function(el1) {
									GD.driver.executeScript("arguments[0].style.outline = ''", el1);
								});
							});
						}
					}
					if(crop) {
						var img = new Buffer(image, 'base64');
						__gm(img)
							.crop(rect.width, rect.height, rect.left, rect.top)
							.write(options.output + '/' + localImageName + '.png', function(err) {
								if(err)
									throw err;

								if(options.debug)
									console.timeEnd("ScreenshotOF " + localImageName);
							});
					} else {
						__fs.writeFile(options.output + '/' + localImageName + '.png', image, 'base64', function(err) {
							if(err)
								throw err;

							if(options.debug)
								console.timeEnd("ScreenshotOF " + localImageName);
						});
					}
				}
			);
		});
	});
	setReturn('![](' + __imgCount + '.png =' + width + 'x*)');

}

/**
 * Preenche infomações de um determinado campo
 * @param  {string} cssSelector css selector do DOM desejado
 * @param  {string} text        Texto que será escrito no campo
 * @return {none}
 */
function fillIn(cssSelector, text) {
	GD.driver.findElement(GD.by.css(cssSelector)).clear();
	GD.driver.findElement(GD.by.css(cssSelector)).sendKeys(text);
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
	GD.driver.findElement(GD.by.css(cssSelector)).submit();
}

/**
 * Clica em um determinado DOM
 * @param  {string} cssSelector css Selector do DOM desejado
 * @return {none}
 */
function click(cssSelector) {
	GD.driver.findElement(GD.by.css(cssSelector)).click();
}

/**
 * Clica em um determinado elemento utilizando o nome do linkText
 * @param  {string} text Texto a ser buscado nos links da interface
 * @return {none}
 */
function clickByLinkText(text) {
	GD.driver.findElement(GD.by.linkText(text)).click();
}

/**
 * Faz o driver parar por um tempo solicitado
 * @param  {int} sleepTime tempo em milisegundos para sleep
 * @return {none}
 */
function sleep(sleepTime) {
	GD.driver.sleep(parseInt(sleepTime));
}

/**
 * Aguarda até um elemento da tela carregar ou até o limite de tempo
 * @param  {string} cssSelector css Selector do DOM desejado
 * @param  {int} timeOut     [Opicional]Tempo em milisegundo, default = 5000
 * @return {none}
 */
function wait(cssSelector, timeOut) {
	var timeLimit = timeOut || 5000;
	GD.driver.wait(GD.until.elementLocated(GD.by.css(cssSelector)), timeLimit);
}

function quit() {
	return GD.driver.quit();
}
