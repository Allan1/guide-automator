# GuideAutomator
[![npm version](https://badge.fury.io/js/guide-automator.svg)](https://badge.fury.io/js/guide-automator)
[![Node Version Needed](https://img.shields.io/badge/node-%3E=6.9.1-brightgreen.svg)](https://nodejs.org/en/download/)

[![](https://nodei.co/npm/guide-automator.png)](https://nodei.co/npm/guide-automator/)
> Automated User Guide Generation with Markdown

----
## Installation
----

* On Linux

  - (Option 1)You can install with script

    ```coffeescript
    sudo wget -qO- https://raw.githubusercontent.com/welbert/guide-automator/master/install_linux.sh | bash -
    ```

  - (Option 2) Manual installation. You need install some binary dependencies.

    1.[Node and npm:](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
    ```
      https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
    ```
    2.[ImageMagick](https://www.imagemagick.org/script/binary-releases.php#unix) (Usually is already installed):
    ```
      https://www.imagemagick.org/script/binary-releases.php#unix
    ```
    3.[Wkhtmltopdf](http://wkhtmltopdf.org/downloads.html)
    ```
      http://wkhtmltopdf.org/downloads.html
    ```
    4.[Chrome](https://www.google.com/chrome/browser/desktop/index.html)/Chromium Browser
    ```
    -Chrome:
      https://www.google.com/chrome/browser/desktop/index.html
    -Chromium:
      sudo apt-get install chromium-browser
    ```
    5.[Chrome WebDriver](https://chromedriver.storage.googleapis.com/index.html?path=2.25/)
    ```
      https://chromedriver.storage.googleapis.com/index.html?path=2.25/
    ```
    6.[Guide-Automator](https://www.npmjs.com/package/guide-automator)
    ```
      sudo npm install -g guide-automator
    ```
  *Node, wkhtmltopdf and Chrome WebDriver need to be add in path.*


* On Windows

  1.[Node and npm:](https://nodejs.org/en/download/)
  ```
    https://nodejs.org/en/download/
  ```
  2.[ImageMagick:](https://www.imagemagick.org/script/binary-releases.php#windows)
  ```
    https://www.imagemagick.org/script/binary-releases.php#windows
  ```
  3.[Wkhtmltopdf](http://wkhtmltopdf.org/downloads.html)
  ```
    http://wkhtmltopdf.org/downloads.html
  ```
  4.[Chrome](https://www.google.com/chrome/browser/desktop/index.html)
  ```
  -Chrome:
    https://www.google.com/chrome/browser/desktop/index.html
  ```
  5.[Chrome WebDriver](https://chromedriver.storage.googleapis.com/index.html?path=2.25/)
  ```
    https://chromedriver.storage.googleapis.com/index.html?path=2.25/
  ```
  6.[Guide-Automator](https://www.npmjs.com/package/guide-automator)
  ```
    npm install -g guide-automator
  ```
  *Node, ImageMagick,wkhtmltopdf and Chrome WebDriver need to be add in path.*


---
## Getting started
---

Guide-automator extract javascript tags (\```javascript guide-automator commands ```) from markdown file and generate manual from them. You need use our [API commands](#api-commands) in markdown file.

Example:
```
# This is my github

```javascript
  get('https://github.com/welbert');
  takeScreenshot();
  takeScreenshotOf('.avatar',false,true);
```(<- three back-ticks)

```
More examples with comments [here](./examples/example.md)

You will need know how to extract css selector of Web elements, you can use browser to do that if you dont know how to do this, see below.

* Google Chrome

![Inspect Element](./extras/Inspect Element - Chrome.png)


![Copy Css Selector](./extras/Copy Selector - Chrome.png)

* Mozilla Firefox

![Inspect Element](./extras/Inspect Element - Firefox.png)


![Copy Css Selector](./extras/Copy Selector - Firefox.png)

After tihs steps, the css selector will be copied to your clipboard

---
## USAGE
---

```
$ guide-automator -h

  Usage: guide-automator [options]

  Options:


    -h, --help             output usage information
    -V, --version          output the version number
    -i, --input <File.md>  Input .md file
    -o, --output <Folder>  Output destination folder
    -P, --pdf              Export manual to PDF, default is export for all types
    -H, --html             Export manual to HTML, default is export for all types
    -I, --image            Export ONLY manual's image and ignore others types, default is export for all types
    -s, --style <style.css>  Css style to be used in the manual or theme [lightBlue,lightOrange]
    -L, --legacy           Use Legacy mode "<automator>" [DEPRECATED]
    -d, --debug              Show progress of code

  Examples:

    $ guide-automator -i input.md -o output/
    $ guide-automator -i input.md
    $ guide-automator -i input.md -o output/ -s lightBlue
```

---
## API commands
---

- [get](#get)
- [click](#click)
- [clickByLinkText](#clickbylinktext)
- [takeScreenshot](#takescreenshot)
- [takeScreenshotOf](#takescreenshotof)
- [fillIn](#fillin)
- [submit](#submit)
- [wait](#wait)
- [sleep](#sleep)


## get
- Params: `<url>`
- Example:
  - get('https://github.com/welbert');

## click
- Params: `<cssSelector>`
- Example:
  - click('.unstarred > button:nth-child(2)');

## clickByLinkText
- Params: `<linkText>`
- Example:
  - clickByLinkText('README.md');

## takeScreenshot
- Params: `[imageWidth]`
- Example:
  - takeScreenshot();
  - takeScreenshot('10%');

## takeScreenshotOf
- Params: `<cssSelector>`, `[crop]`, `[outline]`, `[imageWidth]`
- Example:
  - takeScreenshotOf('#user-content-guideautomator');
  - takeScreenshotOf('#user-content-guideautomator',false,true);

## fillIn
- Params: `<cssSelector>`, `<input>`
- Example:
  - fillIn('.header-search-input','guide-automator');

## submit
- Params: `<cssSelector>`
- Example:
  - submit('.js-site-search-form');

## wait
- Params: `<cssSelector>`, `[timeOut]`
- Example:
  - wait('.commit-author-section');
  - wait('.commit-author-section',2000);

## sleep
- Params: `<milleseconds>`
- Example:
  - sleep(1000);
