/* public/script.js */
var rePattern = /<selenium>([\s\S]+?)<\/selenium>/g;
var seleniumCode = "";

window.onload = function() {
    var converter = new showdown.Converter();
    var pad = document.getElementById('pad');
    var markdownArea = document.getElementById('markdown'); 

    // make the tab act like a tab
    pad.addEventListener('keydown',function(e) {
        if(e.keyCode === 9) { // tab was pressed
            // get caret position/selection
            var start = this.selectionStart;
            var end = this.selectionEnd;

            var target = e.target;
            var value = target.value;

            // set textarea value to: text before caret + tab + text after caret
            target.value = value.substring(0, start)
                            + "\t"
                            + value.substring(end);

            // put caret at right position again (add one for the tab)
            this.selectionStart = this.selectionEnd = start + 1;

            // prevent the focus lose
            e.preventDefault();
        }
    });

    var previousMarkdownValue;          

    var replacer = function(match, p1, offset, string) {
        p1 = p1.replace(/\r?\n|\r/g,'');
        var tmp = document.createElement("DIV");
        tmp.innerHTML = p1;
        p1 = tmp.textContent || tmp.innerText || "";
        seleniumCode = seleniumCode.concat(p1);
        // console.log(p1,offset);
        // console.log('concat',seleniumCode);
      return p1;
    }

    // convert text area to markdown html
    var convertTextAreaToMarkdown = function(){
        // console.log('convertTextAreaToMarkdown');
        var markdownText = pad.value;
        previousMarkdownValue = markdownText;
        html = converter.makeHtml(markdownText);
        html.replace(rePattern, replacer);
        
        
        markdownArea.innerHTML = html;
    };

    var didChangeOccur = function(){
        if(previousMarkdownValue != pad.value){
            return true;
        }
        return false;
    };

    // check every second if the text area has changed
    setInterval(function(){
        if(didChangeOccur()){
            convertTextAreaToMarkdown();
        }
    }, 1000);

    // convert textarea on input change
    pad.addEventListener('input', convertTextAreaToMarkdown);

    // ignore if on home page
    if(document.location.pathname.length > 1){
        // implement share js
        var documentName = document.location.pathname.substring(1);
        sharejs.open(documentName, 'text', function(error, doc) {
            doc.attach_textarea(pad);
            convertTextAreaToMarkdown();
        });        
    }

    // convert on page load
    convertTextAreaToMarkdown();


    var runSelenium = function () {
        console.log('eval',seleniumCode);
        // eval(seleniumCode);
        
        // driver.findElement(By.name('q')).sendKeys('webdriver');
        // driver.findElement(By.name('btnG')).click();
        // driver.wait(until.titleIs('webdriver - Google Search'), 1000);
        // driver.quit();
    }
    $('#run').click(runSelenium);
};
