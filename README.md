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

- Install bower components
```bash
	bower install
```

- Install WiX Toolset <http://wixtoolset.org/>
WiX Toolset is a tool to be used in Windows System to create easy windows installation files. Once you have WiX install through their easy installtion process, you will need to make sure that is in set within the Environments Path of your Window System.

This is critical during installation, since our build will fail to create the msi file if the environment path will fail if it cannot find candle.exe and light.exe

- APP
Additional packages are needed for your application to run smoothly. Inside app directory there are needed dependencies, which contains a basic Angular application with two way communication with electronjs.

```bash
	cd app
	npm install
```

- DONE!
Once you have installed all the necessay build dependencies, you are ready to create your application within the app folder. If you want to install additional library dependencies, you can make those modification inside the bower file, which is located within the root folder. The package.json contains information regarding your new MSI application which can be edited depending on your app.

```json
  "msi": {
    "app_name": "LabCorp Phoenix",
    "app_description": "LabCorp Application",
    "manufacturer": "LabCorp Inc",
    "source": "dist",
    "distribution": "build",
    "path_to_electron": "./electron-v0.31.2-win32-x64"
  }
```
The following command will build the application based of the config in package.json file.

```bash
	grunt build
```

The build command will compile all the contents of app folder into dist folder, which it will be needed to create the msi application. Once the build is completed the MSI file will be located within the build folder containing the following file. 

```
 build
  |-- [APP_NAME].msi
  |-- [APP_NAME].wixobj
  |-- [APP_NAME].wixpdb
  |-- [APP_NAME].wxs
```


## UPGRADE CODE
The current application is using UpgradeCode=8291b2b1-4b33-11e5-975d-29a7531f1924, this is used to set the application UUID, so we can update our app, while not affecting the previous build version. Once we build our updated application, the user may install their new build replacing the old, as long the UpgradeCode does not change. This has already been set within our template.wxs file, which is used to build the application msi.


##Additional Sources
- nodejs <https://nodejs.org/en/docs/>
- iojs <https://iojs.org/en/>
- Wix Toolset Documentation <http://wixtoolset.org/documentation/manual/v3/>
- Free Online PNG to ICO/ICO to PNG Conversion tool <http://convertico.com/>


##Grunt Task
- build
    - build the application sources to dist, and msi package
    
- serve
    - run a grunt server, to test your development progress in localhost:9000
    
- dist
    - Best if you build your application and then test your distribution compile file, in localhost:9000


