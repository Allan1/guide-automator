#! /usr/bin/env node

//TODO Pensar em uma forma de tratar com ```javascript ao invés de <automator>
//TODO olhar os outros TO DO

//--Variaveis ------------------
var fs = require("fs");
var path = require("path");
var showdown = require('showdown');
var wkhtmltopdf = require('wkhtmltopdf');
var input, output;
var outputHTMLFile = 'manual.html';
var outputPDFFile = 'manual.pdf';
var converter = new showdown.Converter({
	parseImgDimensions: true
});
var html_start = '<!DOCTYPE html><html lang="en"><head><title></title><meta charset="UTF-8"></head><body>';
var html_end = '</body></html>';
var wkhtmltopdf_options = {
	pageSize: 'letter',
	output: null,
	toc: true,
	tocHeaderText: 'Índice',
	footerRight: "[page]"
};

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
		return guideAutomator.guideAutomatorParse(data, function(value, err) {
			return exportFiles(value, cb); //Limpa os '<replaceSelenium>' e exporta para pdf e html.
			//TODO Permitir escolher o que exportar, mas por default (pdf e html)
		});
	});
}
//-- Fim Tratamento dos tokens ou execução de funcionalidades 'automator' ------

//-- Tratamento para exportar o produto final ----------
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
