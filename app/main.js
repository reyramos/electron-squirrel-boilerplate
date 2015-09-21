'use strict';
var path = require('path');
var app = require('app');
var ipc = require('ipc');
var http = require("http");
var https = require("https");
var BrowserWindow = require('browser-window');
var angular = require('./lib/ng-electron/ng-bridge');

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getVersion(callback) {
    http.get("http://dev-eligibility-phoenix.labcorp.com/reyramos/builds/build.json", function(res) {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            var obj = JSON.parse(output);
            callback(res.statusCode, obj);
        });

    }).on('error', function(e) {
        callback(e);
    });


}

function createMainWindow() {
    const win = new BrowserWindow({
        width: 1350,
        height: 800,
        resizable: true,
        icon: path.join(__dirname, 'icon.ico'),
        title: 'LabCorp Phoenix',
        //transparent: true,
        //frame: false
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


    getVersion(function(status, obj){
        angular.send(status);
        angular.send(JSON.stringify(obj));
    });


    mainWindow.openDevTools();
    //mainWindow.print();

    mainWindow.webContents.on('did-finish-load', function (e) {
        //Start listening for client messages
        angular.listen(function (msg) {
            console.log('Client: ' + msg);
        });
    });
});
