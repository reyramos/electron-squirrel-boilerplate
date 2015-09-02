var app = require('app');  // Module to control application life.
var ipc = require('ipc');
var Menu = require('menu');
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var angular = require('./lib/ng-electron/ng-bridge');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OSX it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        'height': true,
        'resizable': true,
        //'frame': false
    });

    //Since we are making the application frameless we are going to create a frame within the index.html file
    mainWindow.loadUrl('file://' + __dirname + '/index.html');


    // Open the devtools.
    mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});