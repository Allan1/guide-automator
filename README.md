# GuideAutomator
[![npm version](https://badge.fury.io/js/guide-automator.svg)](https://badge.fury.io/js/guide-automator)
[![Node Version Needed](https://img.shields.io/badge/node-%3E=4.6.1-brightgreen.svg)](https://nodejs.org/en/download/)
> Automated User Guide Generation with Markdown

>> Video Tutorial in Portuguese on [YouTube](https://www.youtube.com/watch?v=zXZyNgJOgdY)

----
## Installation
----

* On Linux

  - (Option 1)You can install with script

    ```coffeescript
    sudo wget -qO- https://raw.githubusercontent.com/welbert/guide-automator/master/install_linux.sh | bash -
    ```
    
  - (Option 2) Manual installation. You need install some binary dependencies.
  
    1.Node and npm:
    ```
      https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
    ```
    2.ImageMagick (Usually is already installed):
    ```
    https://www.imagemagick.org/script/binary-releases.php#unix
    ```
    3.Wkhtmltopdf
    ```
      http://wkhtmltopdf.org/downloads.html
    ```
    4.Chrome/Chromium Browser
    ```
    -Chrome:
    https://www.google.com/chrome/browser/desktop/index.html
    -Chromium:
    sudo apt-get install chromium-browser
    ```
    5.Chrome WebDriver
    ```
    https://chromedriver.storage.googleapis.com/index.html?path=2.25/
    ```
    6.Guide-Automator
    ```
      sudo npm install -g guide-automator
    ```
  *Node, wkhtmltopdf and Chrome WebDriver need to be add in path.*


* On Windows

  1.Node and npm:
  ```
    https://nodejs.org/en/download/
  ```
  2.ImageMagick (Usually is already installed):
  ```
  https://www.imagemagick.org/script/binary-releases.php#windows
  ```
  3.Wkhtmltopdf
  ```
    http://wkhtmltopdf.org/downloads.html
  ```
  4.Chrome/Chromium Browser
  ```
  -Chrome:
  https://www.google.com/chrome/browser/desktop/index.html
  ```
  5.Chrome WebDriver
  ```
  https://chromedriver.storage.googleapis.com/index.html?path=2.25/
  ```
  6.Guide-Automator
  ```
    npm install -g guide-automator
  ```
  *Node, ImageMagick,wkhtmltopdf and Chrome WebDriver need to be add in path.*

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
  - takeScreenshot;
  - takeScreenshot('10%');

## takeScreenshotOf
- Params: `<cssSelector>`, `[crop]`, `[outline]`, `[imageWidth]`
- Example:
  - takeScreenshotOf('#user-content-guideautomator');
  - takeScreenshotOf('#user-content-guideautomator',0,1);

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
