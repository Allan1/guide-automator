var options = {
	output: "",
	outlineStyle: "solid red 3px",
	debug: false,
	autosleep: 200,
	browser: null,
	headless: false,
	window: null
};

module.exports = {
	guideAutomatorParser: guideAutomatorParser,
	defineOptions: defineOptions
};

var guideAutomator = require('./guide-automator-function');

var seleniumBlocks = [];
var markdownText = '';
var html_pagebreak = '<div style="page-break-after: always;"></div>';

function defineOptions(arg) {
	Object.keys(options).forEach(function(key) {
		options[key] = arg[key] || options[key];
	});
}

//-- Fim Tratamento dos blocos 'automator'-----

function replaceRemainingBlocks(cb) {
	markdownText = markdownText.replace(/<replaceSelenium>/g, "").replace(/\\pagebreak/g, html_pagebreak);
	return cb(markdownText);
}

function guideAutomatorParser(mdText, cb) {
	guideAutomator.defineOptions(options);

	return extractJavascript(mdText, function(err, javascriptBlocks) {
		if (err)
			throw err;
		return executeJavascriptSelenium(javascriptBlocks, function(err) {
			if (err)
				throw err;

			guideAutomator.quit().then(function() {
				if (options.debug) {
					console.log("");
					console.timeEnd('Selenium');
				}

				return replaceRemainingBlocks(cb);
			});

		});
	});

}
//-- Fim Tratamento dos tokens ou execução de funcionalidades 'automator' ------
//--------------------------------------------------------------------
//-- Tratamento via javascript
function replaceBlockWithJsStdout(blockIndex, jsStdout) {
	var index = 0;
	markdownText = markdownText.replace(/<replaceSelenium>/g, function(match) {
		index++;
		if ((index - 1) === blockIndex) {
			return '<replaceSelenium>' + jsStdout;
		}
		return match;
	});
}

function extractJavascript(markdownAndCode, cb) {
	var rePattern = /```(?:javascript|js)([\s\S]+?)```/g;
	markdownText = markdownAndCode.replace(rePattern, function(match, p1, offset, string) {
		seleniumBlocks.push(p1);
		return '<replaceSelenium>';
	});
	return cb(null, markdownText);
}

function executeJavascriptSelenium(markdownText, cb) {
	if (options.debug) {
		console.log(`File's JSBlocks: ` + seleniumBlocks.length);
		console.log("");
		console.time('Selenium');
	}

	for (var n_block = 0; n_block < seleniumBlocks.length; n_block++) {
		guideAutomator.executeExternFunction(seleniumBlocks[n_block]);
		var jsStdout = guideAutomator.getReturn();
		replaceBlockWithJsStdout(n_block, jsStdout);
	}
	return cb(null);
}

//-- Fim tratamento via javascript
