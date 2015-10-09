'use strict';
const BrowserWindow = require('browser-window');
const Menu = require('menu');
const angular = require('./ng-electron/ng-bridge');
const http = require("http");
const path = require('path');
const ipc = require('ipc');
const app = require('app');
const fs = require('fs');
const dialog = require('dialog');
const version = require('./version.json');
const MenuItem = require('menu-item');
const utilities = require('./utilities');


const code = fs.readFileSync(__dirname + '/ng-electron-promise.min.js', 'utf8');


const urlBuilds = "http://dev-eligibility-phoenix.labcorp.com/reyramos/builds/build.json";
const webUrl = "https://dev-phoenix.labcorp.com/web-ui/";
//const webUrl = "https://dev-eligibility-phoenix.labcorp.com/reyramos/dist/";

// prevent window being GC'd
let mainWindow;
let splashScreen;


/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getVersion(callback) {
    http.get(urlBuilds, function (res) {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            var obj = JSON.parse(output);
            callback(res.statusCode, obj);
        });

    }).on('error', function (e) {
        callback(e);
    });
}


function createMainWindow(size) {
    const win = new BrowserWindow({
        width: size.width,
        height: size.height,
        resizable: true,
        show: false,
        icon: path.join(__dirname, 'icon.ico'),
        title: 'LabCorp Phoenix'
    });
    win.loadUrl(webUrl);
    win.on('closed', function () {
        mainWindow = null;
    });

    return win;
}


/**
 * Create the main Electron Application
 */
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}).on('activate-with-no-open-windows', function () {
    if (!mainWindow) {
        //LOAD_APPLICATION();
    }
}).on('will-quit', function () {
    console.log('<====================================>');
    console.log('Goodbye');
}).on('ready', LOAD_APPLICATION);


function LOAD_APPLICATION() {
    var count = 0;
    var electronScreen = require('screen');
    var size = electronScreen.getPrimaryDisplay().workAreaSize;


    splashScreen = new BrowserWindow({
        width: 602,
        height: 502,
        resizable: false,
        frame: false,
        'always-on-top': true
    });


    splashScreen.loadUrl('file://' + __dirname + '/dialogs/spash-screen.html?');
    splashScreen.on('closed', function () {
        splashScreen = null;
    })

    mainWindow = createMainWindow(size);

    mainWindow.webContents.on('did-start-loading', function (e) {
        var insertScript = 'var s = document.querySelector( \'.message\' );s.innerHTML="Loading ...";';
        splashScreen.webContents.executeJavaScript(insertScript);
    });

    mainWindow.webContents.on('did-stop-loading', function (e) {
        count++;
        if (count === 3) {
            var insertScript = 'var s = document.querySelector( \'.message\' );s.innerHTML="Completed";';
            splashScreen.webContents.executeJavaScript(insertScript);
            splashScreen.close();//no longer needed
            mainWindow.show();//no longer needed
        }
    });

    mainWindow.webContents.on('dom-ready', function (e) {
        var insertScript = 'var s = document.createElement( \'script\' );var newContent = document.createTextNode(\'' + code + '\');s.appendChild(newContent);document.body.appendChild( s );';
        mainWindow.webContents.executeJavaScript(insertScript);
        mainWindow.webContents.executeJavaScript("document.documentElement.setAttribute('id','ELECTRON_PARENT_CONTAINER');");
        //TODO://Change to application name
        mainWindow.webContents.executeJavaScript("angular.bootstrap(document, ['phxApp']);");
    });

    //open the developer tools
    //mainWindow.openDevTools();
    splashScreen.webContents.on('did-finish-load', function (e) {

        setTimeout(function () {
            getVersion(getVersionCallback);
        }, 500);

        angular.listen(function (data) {
            switch (data.eventType) {
                case 'getVersion':

                    getVersion(function (status, obj) {
                        data.msg.version = obj;
                        angular.send(data);
                    });
                    break;
            }

        });

    });

}


function getVersionCallback(status, obj) {
    var vrsCompare = utilities.versionCompare(obj.version, version.version);
    if (vrsCompare > 0) {
        mainWindow.close();
        splashScreen.close();
        var download = new BrowserWindow({
            width: 402,
            height: 152,
            resizable: false,
            frame: false,
            'always-on-top': true
        });

        download.loadUrl('file://' + __dirname + '/dialogs/download.html?version=' + obj.version);
        download.on('closed', function () {
            download = null;
        })

        //lets close it after 5 minutes
        setTimeout(function () {
            download.destroy();
        }, 1000 * 60 * 5);//terminate after 5 minutes
    }
}