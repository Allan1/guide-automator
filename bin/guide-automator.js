var imgCount = 0;
var options = {
	output: ""
};
var fs = require("fs");

var webdriver = require('selenium-webdriver'),
	By = require('selenium-webdriver').By,
	until = require('selenium-webdriver').until;

var driver = new webdriver.Builder()
	.forBrowser('chrome')
	.build();

exports.defineOptions = function(arg) {
	options = arg;
};

/**
 * Acessa o site
 * @param  {string} url Site a ser acessado
 * @return {none}
 */
exports.get = function(url) {
	driver.get(url);
};

exports.takeScreenshot = function(cssSelector) {
	//var width = DEFAULT_IMG_WIDTH;
	/*if (cmd.params.length > 1) {
		width = cmd.params[1];
	}*/

	//replaceBlockWithImage(cmd.blockIndex, imgCount + '.png', width);
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
