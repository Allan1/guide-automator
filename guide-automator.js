#! /usr/bin/env node


//--Variaveis ------------------
var themeList = ['lightBlue', 'lightOrange'];
var fs = require("fs");
var options = {
	input: "",
	output: ".",
	outlineStyle: "solid red 3px",
	html: false,
	pdf: false,
	/* If true, only image will be export */
	image: false,
	legacy: false,
	style: 'centerImage'
};
var pjson = require('./package.json');
var program = require('commander');
//-- Fim Variaveis ------------------

//-- EXPORTS -------------
exports.defineOptions = function(arg) {
	options.html = options.pdf = true; //Change to default, but can be change on arg
	Object.keys(options)
		.forEach(function(key) {
			options[key] = arg[key] || options[key];
		});
};
exports.generateManual = function(text) {
	if (!text)
		throw "Text input is missing";

	return guideAutomator.guideAutomatorParser(text, function(value, err) {
		if (err)
			throw err;
		guideAutomatorExportFile.exportFiles(value);
	});
};

//-- Fim EXPORTS -------------


//-- Tratamento de Argumentos --------

program.version(pjson.version)
	.option('-i, --input <File.md>', 'Input .md file')
	.option('-o, --output <Folder>', 'Output destination folder', ".")
	.option('-P, --pdf', 'Export manual to PDF, default is export for all types', false)
	.option('-H, --html', 'Export manual to HTML, default is export for all types', false)
	.option('-I, --image', `Export ONLY manual's image and ignore others types, default is export for all types`, false)
	.option('-s, --style <style.css>', 'Css style to be used in the manual or theme [' + themeList.toString() + ']')
	.option('-L, --legacy', 'Use Legacy mode "<automator>" [DEPRECATED]');

program.on('--help', function() {
	console.log('  Examples:');
	console.log('');
	console.log('    $ guide-automator -i input.md');
	console.log('    $ guide-automator -i input.md -o output/');
	console.log('    $ guide-automator -i input.md -o output/ -s lightBlue');
	console.log('');
});

program.parse(process.argv);

Object.keys(options)
	.forEach(function(key) {
		options[key] = program[key] || options[key];
	});

//if image, others exports type are ignored
if (options.image)
	options.pdf = options.html = false;
else {
	//if all exports type are false, change to true all
	if (!options.pdf && !options.html)
		options.pdf = options.html = true;
}

if (!options.input) {
	console.log('Input file missing. See usage with "' + program._name + ' -h"');
	process.exit();
}

if (!fs.existsSync(options.input) || !fs.lstatSync(options.input).isFile()) {
	console.log('Input is not a file');
	process.exit();
}
if (!fs.lstatSync(options.output).isDirectory()) {
	console.log('Output is not a folder');
	process.exit();
}

var guideAutomator = require('./bin/guide-automator-parser');
var guideAutomatorExportFile = require('./bin/guide-automator-export');

guideAutomator.defineOptions(options);
guideAutomatorExportFile.defineOptions(options);


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
		return guideAutomator.guideAutomatorParser(data, function(value, err) {
			if (err)
				throw err;
			guideAutomatorExportFile.exportFiles(value);
		});
	});
}

//-- Fim Tratamento para exportar o produto final ----------
