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
function getJSON(options, onResult) {
    console.log("rest::getJSON");

    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function (res) {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function (err) {
        onResult(err.message);
    });

    req.end();
};


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


    var options = {
        host: 'http://24.211.139.167/build.json',
        //port: 443,
        //path: '/some/path',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    getJSON(options,
        function (statusCode, result) {
            angular.send(statusCode);
            angular.send(JSON.stringify(result));
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
