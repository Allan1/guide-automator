# Acessar o google

```javascript
  console.print("## TESTE");
  get('http://www.google.com');
  //#gb_70
  takeScreenshotOf('#gb_70',false,1,'10%');
  takeScreenshotOf('#hplogo',0,1);
  takeScreenshot();
```

//LEGACY MODE \/
<automator>
  get('http://www.google.com');
  takeScreenshotOf('#hplogo',1,0,'10%');
</automator>

#Pesquisar coisas

Para pesquisar digite no campo.
Exemplo:

```javascript  
//Pensar em substituir o console.log() padrão por setReturn();
  fillIn('#lst-ib','Pesquisar');
  takeScreenshot();
  console.print("2");

```

//LEGACY MODE \/
<automator>
  fillIn('#lst-ib','Pesquisar');
  takeScreenshot;
</automator>
