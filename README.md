##Electron Web UI



This is a complete compiler, for electron to create a Microsoft Self Installer. It will create an installation application based of the content in the app folder. 
The app folder will need to contain the following to build the exe file from electron. It has support to edit resources of the exe file in Windows.

```
 app
  |-- package.json
  |-- main.js
  |-- icon.ico //ico image to replace electronPath/electron.exe during packaging
  |-- icon.png //added png logo to electron app, referenced in main.js
```

```
  //the app/package.json contains the following information for the application electron build
  "name": "phx-electron", //electron appname if productName does not exist
  "version": "1.0.0",
  "description": "",
  "productName": "LabCorp Phoenix", //electron appname
  "execName": "phoenix", //change exec file name
```

##What is Electron?

Electron enables you to create desktop applications with pure JavaScript by providing a runtime with rich native APIs. You could see it as a variant of the io.js runtime which is focused on desktop applications instead of web servers.

This doesn't mean Electron is a JavaScript binding to GUI libraries. Instead, Electron uses web pages as its GUI, so you could also see it as a minimal Chromium browser, controlled by JavaScript.


## Let's get started with Development Environment
- Install Node.JS v6.1.0+
Use your system package manager (brew,port,apt-get,yum etc)

- Install global Grunt commands, once you install the following commands globally, you can run 'npm install' to run the components in the package.json file

```bash
	npm install -g grunt-cli
	npm install //load all your additional package.json components
```


## Install app dependencies
In addition to installing application npm installs from package.json, you will also need to install any dependencies from /app/package.json
Additional packages are needed for your application to run smoothly. Inside app directory there are needed dependencies, which contains a basic Angular application with two way communication with electronjs.
```bash
	cd app/
	npm install //load all your additional package.json components
```

- Install WiX Toolset <http://wixtoolset.org/>
WiX Toolset is a tool to be used in Windows System to create easy windows installation files. Once you have WiX install through their easy installtion process, you will need to make sure that is in set within the Environments Path of your Window System.

This is critical during installation, since our build will fail to create the msi file if the environment path will fail if it cannot find candle.exe and light.exe

- DONE!
Once you have installed all the necessay build dependencies, you are ready to create your application within the app folder. If you want to install additional library dependencies, you can make those modification inside the bower file, which is located within the root folder. The package.json contains information regarding your new MSI application which can be edited depending on your app.

```
 
 ./
  |-- package.json
  |-- app/ //app source code to build electron
  |-- scripts/ //source code to build electron and msi
  |-- electron.config.js //define electron version to build, addition package information and versioning information server/host path
  
```
The following command will build the application based of the config in package.json file.

```bash
	grunt build
```



## UPGRADE CODE
The current application is using UpgradeCode=8291b2b1-4b33-11e5-975d-29a7531f1924, this is used to set the application UUID, so we can update our app, while not affecting the previous build version. Once we build our updated application, the user may install their new build replacing the old, as long the UpgradeCode does not change. This has already been set within our template.wxs file, which is used to build the application msi.

```
    <Product Name='LabCorp Phoenix'
             Id='b54d1bd0-5340-11e5-9de9-ebdce6a5a6b0'
             UpgradeCode='8291b2b1-4b33-11e5-975d-29a7531f1924'
             Language='1033' Version='1.0.0' Manufacturer='LabCorp Inc'>
```

##Grunt Task
- Usage
 - grunt [task][:option]

- tasks
    - build:           Builds the Electron package and msi installation
    - candle:          Builds *.wixobj file
    - light:           Builds *.msi script, removes *.wixobj file

- options
    - electron:        Builds the Electron package
    - msi:             Builds the Electron && *.wxs file

## Application LifeCycle
``` txt
app (EVENT)
	window-all-closed => app.quit()
	activate-with-no-open-windows => displaySplashScreen()
	gpu-process-crashed => mainWindow.destroy()
	will-quit
	ready => displaySplashScreen()
		
		
displaySplashScreen()
	splashScreen.on(did-finish-load) => 
		validateURL(promise) => 
			LOAD_APPLICATION()
			!mainWindow?startMainApplication():null
			

startMainApplication()
	createMainWindow(promise) => return mainWindow
		mainWindow (EVENT)
			did-start-loading
			did-fail-load => mainWindow.close()
			dom-ready => mainWindow.executeJavaScript("//insert to application electron identifier to webapp") 
			did-finish-load =>
			did-stop-loading => electronInsertion()
```
	
## RDC
2UA2300TTV
2UA2280PC5


##Additional Sources
- nodejs <https://nodejs.org/en/docs/>
- iojs <https://iojs.org/en/>
- Wix Toolset Documentation <http://wixtoolset.org/documentation/manual/v3/>
- Free Online PNG to ICO/ICO to PNG Conversion tool <http://convertico.com/>

