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


var options = {
	output: "",
	outlineStyle: "solid red 3px"
};


exports.defineOptions = function(arg) {
	options.output = arg.output;
	options.outlineStyle = arg.outlineStyle;
};

/**
 * Acessa o site
 * @param  {string} url Site a ser acessado
 * @return {none}
 */
exports.get = function(url) {
	driver.get(url);
};

/**
 * Tira foto da parte visivel do site acessado
 * @return {string}   Nome da imagem gerada
 */
exports.takeScreenshot = function() {
	imgCount++;

	driver.takeScreenshot().then(
		function(image, err) {
			if (err) {
				throw err;
			} else {
				fs.writeFile(options.output + '/' + imgCount + '.png', image, 'base64', function(err) {
					if (err) {
						throw err;
					}
				});
			}
		}
	);
	return imgCount + '.png';
};

/**
 * Tira foto do cssSelector passado, podendo dar crop ou highlight
 * @param  {string} cssSelector Css selector do DOM
 * @param  {int} crop        [Opicional] 1 - crop ativo, 0 - crop inativo
 * @param  {int} outline     [Opicional] 1 - outline ativo, 0 - outline inativo
 * @return {string}             Nome da imagem gerada
 */
exports.takeScreenshotOf = function(cssSelector, crop, outline) {
	imgCount++;

	driver.findElement(By.css(cssSelector)).then(function(el) {
		if (outline) {
			driver.executeScript("arguments[0].style.outline = '" + options.outlineStyle + "'", el);
		}
		driver.executeScript("return arguments[0].getBoundingClientRect()", el).then(function(rect) {
			driver.takeScreenshot().then(
				function(image, err) {
					driver.executeScript("arguments[0].style.outline = ''", el);
					if (crop) {
						var img = new Buffer(image, 'base64');
						gm(img)
							.crop(rect.width, rect.height, rect.left, rect.top)
							.write(options.output + '/' + imgCount + '.png', function(err) {
								if (err) {
									throw err;
								}
							});
					} else {
						fs.writeFile(options.output + '/' + imgCount + '.png', image, 'base64', function(err) {
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
};

/**
 * Preenche infomações de um determinado campo
 * @param  {string} cssSelector css selector do DOM desejado
 * @param  {string} text        Texto que será escrito no campo
 * @return {none}
 */
exports.fillIn = function(cssSelector, text) {
	driver.findElement(By.css(cssSelector)).clear();
	driver.findElement(By.css(cssSelector)).sendKeys(text);
};

/**
 * Faz o submit no cssSelector
 * @param  {string} cssSelector css Selector do DOM desejado
 * @return {none}
 */
exports.submit = function(cssSelector) {
	driver.findElement(By.css(cssSelector)).submit();
};

/**
 * Clica em um determinado DOM
 * @param  {string} cssSelector css Selector do DOM desejado
 * @return {none}
 */
exports.click = function(cssSelector) {
	driver.findElement(By.css(cmds[i].params[0])).click();
};

/**
 * Clica em um determinado elemento utilizando o nome do linkText
 * @param  {string} text Texto a ser buscado nos links da interface
 * @return {none}
 */
exports.clickByLinkText = function(text) {
	driver.findElement(By.linkText(text)).click();
};

/**
 * Faz o driver parar por um tempo solicitado
 * @param  {int} sleepTime tempo em milisegundos para sleep
 * @return {none}
 */
exports.sleep = function(sleepTime) {
	driver.sleep(parseInt(sleepTime));
};

/**
 * Aguarda até um elemento da tela carregar ou até o limite de tempo
 * @param  {string} cssSelector css Selector do DOM desejado
 * @param  {int} timeOut     [Opicional]Tempo em milisegundo, default = 5000
 * @return {none}
 */
exports.wait = function(cssSelector, timeOut) {
	var timeLimit = timeOut || 5000;
	driver.wait(until.elementLocated(By.css(cssSelector)), timeLimit);
};
