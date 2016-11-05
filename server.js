#! /usr/bin/env node

//TODO Pensar em uma forma de tratar com ```javascript ao invés de <automator>

//--Variaveis ------------------
var fs = require("fs");
var options = {
	input: "",
	output: ".",
	html: true,
	pdf: true
};
var pjson = require('./package.json');
var guideAutomator = require('./bin/guide-automator');
var guideAutomatorExportFile = require('./bin/guide-automator-export');
var program = require('commander');
//-- Fim Variaveis ------------------

//-- EXPORTS -------------
exports.defineOptions = function(arg) {
	Object.keys(options).forEach(function(key) {
		options[key] = arg[key] || options[key];
	});
};
exports.generateManual = function(text) {
	if (!text)
		throw "Text input is missing";

	return guideAutomator.guideAutomatorParse(text, function(value, err) {
		if (err)
			throw err;
		guideAutomatorExportFile.exportFiles(value);
	});
};

//-- Fim EXPORTS -------------


//-- Tratamento de Argumentos --------

program.version(pjson.version)
	.option('-i, --input <File.md>', 'Input .md file')
	.option('-o, --output <Folder>', 'Output destination folder', ".");

program.on('--help', function() {
	console.log('  Examples:');
	console.log('');
	console.log('    $ guide-automator -i input.md -o output/');
	console.log('    $ guide-automator -i input.md');
	console.log('');
});

program.parse(process.argv);

if (!program.input) {
	console.log('Input file missing. See usage with "' + program._name + ' -h"');
	process.exit();
}
options.input = program.input;
options.output = program.output;

guideAutomator.defineOptions(options);
guideAutomatorExportFile.defineOptions(options);

if (!fs.lstatSync(options.input).isFile()) {
	console.log('Input is not a file');
	process.exit();
}
if (!fs.lstatSync(options.output).isDirectory()) {
	console.log('Output is not a folder');
	process.exit();
}

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
			if (err)
				throw err;
			guideAutomatorExportFile.exportFiles(value);
		});
	});
}
