var fs = require("fs");
var showdown = require('showdown');
var wkhtmltopdf = require('wkhtmltopdf');
var path = require("path");

var folderLib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib/style/');

var html_script = '<script>' + fs.readFileSync(folderLib + 'TOC.js') + '</script>';
var html_css = fs.readFileSync(folderLib + 'default.css');
var html_start = '';
var html_end = '</body></html>';
var html_footer = '</div><div style="bottom:0;font-size: 0.7em;">Made with guide-automator.</div>' + html_script;
var outputHTMLFile = 'manual.html';
var outputPDFFile = 'manual.pdf';
var themeRegex = /^(default|lightBlue|lightOrange)$/;


var wkhtmltopdf_options = {
	pageSize: 'letter',
	output: null,
	toc: true,
	tocHeaderText: 'Índice',
	"footer-html": folderLib + "footer.html",
	"header-html": folderLib + "header.html"
		//footerRight: "[page]"
};
var converter = new showdown.Converter({
	parseImgDimensions: true
});


var options = {
	output: "",
	html: false,
	pdf: false,
	style: 'default',
	debug: false
};

function updateHtmlStart() {
	html_start = '<!DOCTYPE html><html lang="en"><head><title></title><meta charset="UTF-8"><style>' + html_css +
		'</style></head><body><div id="toc"></div><div id="contents">';
}

function defineOptions(arg) {
	Object.keys(options)
		.forEach(function(key) {
			options[key] = arg[key] || options[key];
		});
	//TODO Fazer com que o css utilizem sempre o default e junto com os outros
	updateHtmlStart();
	if(options.style) {
		if(options.style.match(themeRegex)) {
			var localCss = folderLib + options.style + '.css';
			if(options.style != "default") {
				html_css += fs.readFileSync(localCss);
				updateHtmlStart();
			}
			wkhtmltopdf_options["user-style-sheet"] = localCss;
		} else {
			if(!fs.existsSync(options.style) || !fs.lstatSync(options.style).isFile()) {
				console.log('Style is not a file or not exists, will not be used');
			} else {
				html_css += fs.readFileSync(options.style);
				updateHtmlStart();

				wkhtmltopdf_options['dpi'] = 100;
				wkhtmltopdf_options['image-quality'] = 100;
				wkhtmltopdf_options["margin-left"] = 0;
				wkhtmltopdf_options["margin-right"] = 0;
				wkhtmltopdf_options['margin-bottom'] = '10mm';
				wkhtmltopdf_options['footer-spacing'] = 0;

				//FIXME Problem with background
				wkhtmltopdf_options["user-style-sheet"] = options.style;
				//wkhtmltopdf_options["disable-smart-shrinking"] = true;
			}
		}
	}

	wkhtmltopdf_options["margin-top"] = '10mm';
	wkhtmltopdf_options.output = options.output + '/' + outputPDFFile;
}

function exportFiles(text, cb) {
	if(options.html || options.pdf) {
		var html = html_start + converter.makeHtml(text);
		if(options.html)
			fs.writeFileSync(options.output + '/' + outputHTMLFile, html + html_footer + html_end);

		if(options.pdf)
			exportPDF(html + html_end);
	}
	if(options.debug)
		console.timeEnd("Guide-Automator");
}

function exportPDF(html) {
	var basePath = 'file:///' + path.resolve(options.output)
		.replace(/\\/g, '/') + '/';
	html_full_path_imgs = html.replace(/img src="/g, function(match) {
		return match + basePath;
	});

	wkhtmltopdf(html_full_path_imgs, wkhtmltopdf_options, function(err, stream) {
		if(err) throw err;
	});
}

module.exports = {
	defineOptions: defineOptions,
	exportFiles: exportFiles
};
