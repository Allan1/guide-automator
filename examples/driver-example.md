# This is an example of GD.Driver

```javascript
get('https://welbert.github.io/click.html');
takeScreenshot();

sleep(1000);
GD.driver.actions().
  mouseMove({x:455, y:213}).
  click().
  perform();

takeScreenshot();
sleep(1000);

GD.driver.actions().
  mouseMove({x:92, y:25}).
  click().
  perform();

takeScreenshot();
```
### This is a simple example, but you can use the driver to other things
See more [Selenium Documentation](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/chrome_exports_Driver.html)
