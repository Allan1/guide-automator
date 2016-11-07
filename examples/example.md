# Acessar o google

```javascript
  setReturn("## TESTE");
  get('http://www.google.com');
  takeScreenshotOf('#hplogo',0,1);
```

//LEGACY MODE \/
<automator>
  get('http://www.google.com');
  takeScreenshotOf('#hplogo',0,1);
</automator>

#Pesquisar coisas

Para pesquisar digite no campo.
Exemplo:

```javascript  
  fillIn('#lst-ib','Pesquisar');
  takeScreenshot();
  console.log("2");
  //Pensar em substituir o console.log() padrão por setReturn();

```

//LEGACY MODE \/
<automator>
  fillIn('#lst-ib','Pesquisar');
  takeScreenshot;
</automator>
