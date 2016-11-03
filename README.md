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


Prerequisite
=========
### Node.js native addon build tool

Use your system package manager (brew,port,apt-get,yum etc)

Installation
------------

You can install with `npm`:

``` bash
$ npm install -g node-gyp-install
$ npm install -g node-gyp
$ npm install -g grunt-cli


```

You will also need to install:
* Make sure to delete any Microsoft Redistributable, and Microsoft Visual Studios before reinstalling the following


  * On Windows:
    * Visual C++ Build Environment:
      * Option 1: Install [Visual C++ Build Tools](http://landinghub.visualstudio.com/visual-cpp-build-tools) using the **Default Install** option.

      * Option 2: Install [Visual Studio 2015](https://www.visualstudio.com/products/visual-studio-community-vs) (or modify an existing installation) and select *Common Tools for Visual C++* during setup. This also works with the free Community and Express for Desktop editions.

      > :bulb: [Windows Vista / 7 only] requires [.NET Framework 4.5.1](http://www.microsoft.com/en-us/download/details.aspx?id=40773)

    * Install [Python 2.7](https://www.python.org/downloads/) (`v3.x.x` is not supported), and run `npm config set python python2.7` (or see below for further instructions on specifying the proper Python version and path.)
    * Launch cmd, `npm config set msvs_version 2015`

    If the above steps didn't work for you, please visit [Microsoft's Node.js Guidelines for Windows](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#compiling-native-addon-modules) for additional tips.

If you have multiple Python versions installed, you can identify which Python
version `node-gyp` uses by setting the '--python' variable:

``` bash
$ node-gyp --python /path/to/python2.7
```

##Additional Sources
- nodejs <https://nodejs.org/en/docs/>
- iojs <https://iojs.org/en/>
- Wix Toolset Documentation <http://wixtoolset.org/documentation/manual/v3/>
- Free Online PNG to ICO/ICO to PNG Conversion tool <http://convertico.com/>