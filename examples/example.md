# Acessar o google

<automator>
  get('http://www.google.com');
  takeScreenshotOf('#hplogo',0,1);
</automator>

#Pesquisar coisas

Para pesquisar digite no campo.
Exemplo:

<automator>
  fillIn('#lst-ib','Pesquisar');
  takeScreenshot;
</automator>
