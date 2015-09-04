##Electron Web UI
This is a complete compiler, for electron to create a Microsoft Self Installer. It will create an installation application based of the content in the app folder. 
The app folder will need to contain the following to build the exe file from electron. It has support to edit resources of the exe file in Windows.

```
 app
  |-- package.json
  |-- main.js
  |-- icon.ico //ico image to replace electronPath/electron.exe during packaging
  |-- icon.png //added png logo to electron app, referenced in main.js
  |-- index.html
```

##What is Electron?

Electron enables you to create desktop applications with pure JavaScript by providing a runtime with rich native APIs. You could see it as a variant of the io.js runtime which is focused on desktop applications instead of web servers.

This doesn't mean Electron is a JavaScript binding to GUI libraries. Instead, Electron uses web pages as its GUI, so you could also see it as a minimal Chromium browser, controlled by JavaScript.


## Let's get started with Development Enviroment
- Install Node.JS
Use your system package manager (brew,port,apt-get,yum etc)

- Install global Yeoman, Grunt and Bower commands, once you install the following commands globally, you can run 'npm install' to run the components in the package.json file

```bash
	npm install -g grunt-cli bower
	npm install //load all your additional package.json components
```

- Install WiX Toolset <http://wixtoolset.org/>
WiX Toolset is a tool to be used in Windows System to create easy windows installation files. Once you have WiX install through their easy installtion process, you will need to make sure that is in set within the Environments Path of your Window System.

This is critical during installation, since our build will fail to create the msi file if the environment path will fail if it cannot find candle.exe and light.exe


## UPGRADE CODE
The current application is using UpgradeCode '8291b2b1-4b33-11e5-975d-29a7531f1924', this is used to set the application UUID, so we can update our app, while not affecting the previous build version. Once we build our updated application, the user may install their new build replacing the old, as long the UpgradeCode does not change. This has already been set within our template.wxs file, which is used to build the application msi.


##Additional Sources
nodejs <https://nodejs.org/en/docs/>
iojs <https://iojs.org/en/>
Wix Toolset Documentation <http://wixtoolset.org/documentation/manual/v3/>
Free Online PNG to ICO/ICO to PNG Conversion tool <http://convertico.com/>