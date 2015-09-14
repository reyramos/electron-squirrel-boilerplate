/**
 * Amy is Awesome!
 */
'use strict';
var path = require('path');
var app = require('app');
var ipc = require('ipc');

var BrowserWindow = require('browser-window');
var Menu = require('menu');

var angular = require('./lib/ng-electron/ng-bridge');

function createMainWindow() {
    const win = new BrowserWindow({
        'width': 1250,
        'height': 800,
        'resizable': true,
        icon: path.join(__dirname, 'icon.png'),
        title: 'LabCorp Phoenix' //this is set by the index file
    });

    win.loadUrl('file://' + __dirname + '/index.html');
    win.on('closed', onClosed);

    return win;
}

function onClosed() {
    mainWindow = null;
}
// prevent window being GC'd
let mainWindow;

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate-with-no-open-windows', function () {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    }
});

app.on('will-quit', function () {
    console.log('<====================================>');
    console.log('Electron Says, "Stay Awesome Kids!"');
    console.log('<====================================>');
});

app.on('ready', function () {
    mainWindow = createMainWindow();
    mainWindow.webContents.on('dom-ready', function (e) {
        //try and manually bootstrap AngularJS
        //var code = "angular.bootstrap(document, ['app']);"
        //mainWindow.webContents.executeJavaScript( code );
        angular.send("Hello from Electron");
    });

    //mainWindow.openDevTools();
    mainWindow.webContents.on('did-finish-load', function (e) {
        //Start listening for client messages
        angular.listen(function (msg) {
            console.log('Client: ' + msg);
        });
    });
});
