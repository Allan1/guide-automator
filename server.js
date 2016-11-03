#! /usr/bin/env node

//TODO Pensar em uma forma de tratar com ```javascript ao invés de <automator>
//TODO olhar os outros TO DO

//--Variaveis ------------------
var DEFAULT_IMG_WIDTH = '60%';
var fs = require("fs");
var path = require("path");
var showdown = require('showdown');
var wkhtmltopdf = require('wkhtmltopdf');
var input, output;
var outputHTMLFile = 'manual.html';
var outputPDFFile = 'manual.pdf';
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
var seleniumBlocks = [];
var markdownText = '';
var converter = new showdown.Converter({
	parseImgDimensions: true
});
var html_start = '<!DOCTYPE html><html lang="en"><head><title></title><meta charset="UTF-8"></head><body>';
var html_end = '</body></html>';
var html_pagebreak = '<div style="page-break-after: always;"></div>';
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

guideAutomator = require('./bin/guide-automator');

//-- Fim Variaveis ------------------

//-- EXPORTS -------------
//TODO Criar um export que preste, caso dê suporte a export
exports.printMsg = function() {
	console.log("This is a message from the demo package");
};

//-- Fim EXPORTS -------------


//-- Tratamento de Argumentos --------
//TODO Pensar em usar o commander
if (!process.argv[2]) {
	console.log('Input file missing');
	process.exit();
}
input = process.argv[2];

if (!process.argv[3]) {
	console.log('Output folder missing');
	process.exit();
}
output = process.argv[3];
wkhtmltopdf_options.output = output + '/' + outputPDFFile;

guideAutomator.defineOptions({
	output: output
});

fs.stat(input, function(err, stats) {
	if (err) {
		console.log('Input is not a file');
		process.exit();
	}
});

fs.stat(output, function(err, stats) {
	if (err) {
		console.log('Output is not a folder');
		process.exit();
	}
});

//-- Fim Tratamento de Argumentos --------

//-- Tratamento dos blocos 'automator'-----
processInput(input, function(err) {
	if (err) {
		throw err;
	}
});

function processInput(input, cb) {
	fs.readFile(input, 'utf8', (err, data) => { //Leitura do arquivo
		if (err) {
			return cb(err);
		}
		return extractMarkdownAndSelenium(data, function(seleniumBlocks) { //Extração dos blocos 'automator'
			return execSelenium(seleniumBlocks, function(err) { //Execução e tratamento dos tokens dos blocos 'automator'
				if (err) {
					return cb(err);
				} else {
					driver.quit().then(function() {
						clearAndExportFiles(cb); //Limpa os '<replaceSelenium>' e exporta para pdf e html.
						//TODO Permitir escolher o que exportar, mas por default (pdf e html)
					});
				}
			});
		});
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
//TODO Isolar a lógica de cada funcionalidade e chamar pelo require
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

function replaceRemainingBlocks(cb) {
	markdownText = markdownText.replace(/<replaceSelenium>/g, "").replace(/\\pagebreak/g, html_pagebreak);
	return cb(null, markdownText);
}

//-- Fim Tratamento dos tokens ou execução de funcionalidades 'automator' ------

//-- Tratamento para exportar o produto final ----------
//TODO Isolar a lógica de cada funcionalidade e chamar pelo require
function clearAndExportFiles(cb) {
	replaceRemainingBlocks(function(err, outputMarkdown) {
		if (err) {
			return cb(err);
		} else {
			return exportFiles(outputMarkdown, cb);
		}
	});
}

function exportFiles(text, cb) {
	var html = html_start + converter.makeHtml(text) + html_end;
	fs.writeFileSync(output + '/' + outputHTMLFile, html);

	return exportPDF(html, cb);
}

function exportPDF(html, cb) {
	var basePath = 'file:///' + path.resolve(output).replace(/\\/g, '/') + '/';
	html_full_path_imgs = html.replace(/img src="/g, function(match) {
		return match + basePath;
	});

	wkhtmltopdf(html_full_path_imgs, wkhtmltopdf_options, function(err, stream) {
		if (err) return cb(err);
		else {
			return cb(null);
		}
	});
}

//-- Fim Tratamento para exportar o produto final ----------
