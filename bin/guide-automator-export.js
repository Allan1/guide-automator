var fs = require("fs");
var html_start = '<!DOCTYPE html><html lang="en"><head><title></title><meta charset="UTF-8"></head><body>';
var html_end = '</body></html>';
var outputHTMLFile = 'manual.html';
var outputPDFFile = 'manual.pdf';

var showdown = require('showdown');
var wkhtmltopdf = require('wkhtmltopdf');
var path = require("path");
var wkhtmltopdf_options = {
	pageSize: 'letter',
	output: null,
	toc: true,
	tocHeaderText: 'Índice',
	"footer-html": "lib/style/footer.html"
		//footerRight: "[page]"
};
var converter = new showdown.Converter({
	parseImgDimensions: true
});


var options = {
	output: "",
	html: false,
	pdf: false,
	style: null
};

function defineOptions(arg) {
	Object.keys(options)
		.forEach(function(key) {
			options[key] = arg[key] || options[key];
		});

	if (options.style) {
		html_start = '<!DOCTYPE html><html lang="en"><head><title></title><meta charset="UTF-8"><style>' +
			fs.readFileSync(options.style) + '</style></head><body>';
		/*wkhtmltopdf_options["margin-top"] = 0;
		wkhtmltopdf_options["margin-left"] = 0;
		wkhtmltopdf_options["margin-right"] = 0;
		//wkhtmltopdf_options["margin-bottom"] = 0;*/

		wkhtmltopdf_options['page-width'] = '216mm';
		wkhtmltopdf_options['page-height'] = '279mm';
		wkhtmltopdf_options['dpi'] = 96;
		wkhtmltopdf_options['image-quality'] = 100;
		wkhtmltopdf_options["margin-top"] = 0;
		wkhtmltopdf_options["margin-left"] = 0;
		wkhtmltopdf_options["margin-right"] = 0;
		wkhtmltopdf_options['margin-bottom'] = '10mm';
		wkhtmltopdf_options['footer-spacing'] = 0,

			wkhtmltopdf_options["user-style-sheet"] = options.style;
		wkhtmltopdf_options["disable-smart-shrinking"] = true;
		wkhtmltopdf_options["no-outline"] = true;
	}

	wkhtmltopdf_options.output = options.output + '/' + outputPDFFile;
}

function exportFiles(text, cb) {
	if (options.html || options.pdf) {
		var html = html_start + converter.makeHtml(text) + html_end;
		if (options.html)
			fs.writeFileSync(options.output + '/' + outputHTMLFile, html);

		if (options.pdf)
			exportPDF(html);
	}
}

function exportPDF(html) {
	var basePath = 'file:///' + path.resolve(options.output)
		.replace(/\\/g, '/') + '/';
	html_full_path_imgs = html.replace(/img src="/g, function(match) {
		return match + basePath;
	});

	wkhtmltopdf(html_full_path_imgs, wkhtmltopdf_options, function(err, stream) {
		if (err) throw err;
	});
}

module.exports = {
	defineOptions: defineOptions,
	exportFiles: exportFiles
};
