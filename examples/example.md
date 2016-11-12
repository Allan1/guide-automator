# Acessar o google

```javascript
  console.log("## TESTE");
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
//Pensar em substituir o console.log() padrão por setReturn();
  fillIn('#lst-ib','Pesquisar');
  takeScreenshot();
  console.log("2");

```

//LEGACY MODE \/
<automator>
  fillIn('#lst-ib','Pesquisar');
  takeScreenshot;
</automator>
