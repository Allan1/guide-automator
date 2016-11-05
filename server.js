#! /usr/bin/env node

//TODO Pensar em uma forma de tratar com ```javascript ao invés de <automator>
//TODO olhar os outros TO DO

//--Variaveis ------------------
var fs = require("fs");
var options = {
	input: "",
	output: "",
	html: true,
	pdf: true
};
var pjson = require('./package.json');
var guideAutomator = require('./bin/guide-automator');
var guideAutomatorExportFile = require('./bin/guide-automator-export');
//var program = require('commander');
//-- Fim Variaveis ------------------

//-- EXPORTS -------------
//TODO Criar um export que preste, caso dê suporte a export
exports.printMsg = function() {
	console.log("This is a message from the demo package");
};

//-- Fim EXPORTS -------------


//-- Tratamento de Argumentos --------
/*
program
	.version(pjson.version)
	.option('-i, --input', 'Input .md file')
	.option('-o, --output', 'Output folder')
	.parse(process.argv);
*/
if (!process.argv[2]) {
	console.log('Input file missing');
	process.exit();
}
options.input = process.argv[2];

if (!process.argv[3]) {
	console.log('Output folder missing');
	process.exit();
}
options.output = process.argv[3];

guideAutomator.defineOptions(options);
guideAutomatorExportFile.defineOptions(options);

fs.stat(options.input, function(err, stats) {
	if (err) {
		console.log('Input is not a file');
		process.exit();
	}
});

fs.stat(options.output, function(err, stats) {
	if (err) {
		console.log('Output is not a folder');
		process.exit();
	}
});

//-- Fim Tratamento de Argumentos --------

//-- Tratamento dos blocos 'automator'-----
processInput(options.input, function(err) {
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
			guideAutomatorExportFile.exportFiles(value, cb);
		});
	});
}
