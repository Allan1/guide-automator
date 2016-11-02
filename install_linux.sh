#!/bin/sh

set -e

is_executable () {
  command -v "$1" >/dev/null 2>&1
}
  
errcho () {
  >&2 echo "$@"
}

echo "# Installing Guide-Automator..."

if ! (is_executable npm && is_executable node); then
  echo " # Installing Nodejs"
  if is_executable wget; then
    wget -qO- https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs
  elif is_executable curl; then
    curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    errcho "Couldn't determine OS. Please install NodeJS manually, then run this script again."
    errcho "Visit https://github.com/joyent/node/wiki/installing-node.js-via-package-manager for instructions on how to install NodeJS on your OS."
    exit 1    
  fi
  rm setup_6.x
fi

if ! (is_executable wkhtmltopdf); then
  echo " # Installing Dependencie WKHTMLTOPDF"
  case $( uname -m ) in
  x86_64) 
    wget http://download.gna.org/wkhtmltopdf/0.12/0.12.3/wkhtmltox-0.12.3_linux-generic-amd64.tar.xz -O wkhtmltox.tar.xz;;
  *)
    wget http://download.gna.org/wkhtmltopdf/0.12/0.12.3/wkhtmltox-0.12.3_linux-generic-i386.tar.xz -O wkhtmltox.tar.xz;;
  esac
  tar -xf wkhtmltox.tar.xz
  rm wkhtmltox.tar.xz
  sudo mv wkhtmltox/ /usr/lib/
  cd /usr/bin/
  sudo ln -s ../lib/wkhtmltox/bin/wkhtmltopdf wkhtmltopdf
  cd ~
fi
  
if ! (is_executable imagemagick); then
  echo " # Installing Dependencie IMAGEMAGICK"
  sudo apt-get install imagemagick -y
fi  

if ! (is_executable chromedriver) ; then
  echo " # Installing Dependencie CHROMEDRIVER"
  case $( uname -m ) in
  x86_64) 
    wget https://chromedriver.storage.googleapis.com/2.25/chromedriver_linux64.zip -O chromedriver.zip;;
  *)
    wget https://chromedriver.storage.googleapis.com/2.25/chromedriver_linux32.zip -O chromedriver.zip;;
  esac
  

  unzip chromedriver.zip
  sudo mv chromedriver /usr/bin/
  rm chromedriver.zip  
fi

sudo npm install -g guide-automator
