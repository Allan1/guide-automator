window.onload = function() {
	var toc = "<ul>";
	var level = 0;
	var regId = '"(.*?)"';
	var headers = document.getElementById("contents").innerHTML.match(/<h[\d]+[^>]*>/gi);
	var id, title;
	for (var i = 0; i < headers.length - 1; i++) {
		id = headers[i].match(regId)[1];
		title = document.getElementById(id).innerHTML;
		if (headers[i].charAt(2) < headers[i + 1].charAt(2)) {
			toc += '<li> <a href="#' + id + '">' + title + '</a></li><ul>';
		} else if (headers[i].charAt(2) > headers[i + 1].charAt(2)) {
			toc += '<li> <a href="#' + id + '">' + title + '</a></li></ul>';
		} else {
			toc += '<li> <a href="#' + id + '">' + title + '</a></li>';
		}
	}
	id = headers[headers.length - 1].match(regId)[1];
	title = document.getElementById(id).innerHTML;
	toc += '<li> <a href="#' + id + '">' + title + '</a></li>';
	toc += "</ul>";
	document.getElementById("toc").innerHTML += "<h1>Índice</h1>" + toc;
};
