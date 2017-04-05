# Github - Getting Started

## Create a new account

  First of all, you need access [https://github.com](https://github.com).

```javascript
//Declare global variable
GDGLOBAL["SITE"] = 'github';

  //Access url
  get('https://github.com/');

  //Take Screenshot of actual state
  takeScreenshot();
```

After this, you'll need create account, if you don't have, if you have, jump for next topic.

To create new account, click on 'Sign Up' or fill in the form's fields.

```javascript
  //Take screenshot of css selectors, with no crop and with outline
  takeScreenshotOf(['a.text-bold:nth-child(4)','.col-md-5'],false,true);

  //Click in button 'sign out'
  click('button.btn');

  //Take screenshot of actual state
  takeScreenshot();

  //Sleep for 500ms, if u need wait page load
  sleep(500);

  //Fill in css selector with text
  fillIn('#user_login','PutYourUserName');
  fillIn('#user_email','yourEmail@email.com');
  fillIn('#user_password','SuperSecretPassword');

  sleep(200);

  //Print text on markdown file
  console.print('_PS:_ If you agreeing with '+GDGLOBAL["SITE"]+
  ' terms, you can click on "Create an account"');

  takeScreenshotOf('#signup_button',false,true);
```

## Search things

Github is a repository of so many codes and others things. You can search for a specific repository, person, wiki and etc, using 'Search Github' and write what you want.

```javascript
  get('https://github.com/');

  fillIn('.header-search-input','Welbert Serra');

  takeScreenshotOf('.header-search-input',false,true);

  //Submit form
  submit('.js-site-search-form');

  //Wait for element load
  wait('div.column:nth-child(1)');

  takeScreenshot();
```

In this page, we have a extra information. Like:

```javascript
  //takeScreenshotOf with crop and height ajust
  takeScreenshotOf('.underline-nav',true,false,'50%');

  console.print('We can filter using Repositories, Code, Issues, Wikis and Users (_In this case, i wanted to search myself_)')

  click('a.underline-nav-item:nth-child(6)');
  sleep(1500);
  takeScreenshot();

```
