/**
 * A Node module for Electron ipc messaging.
 * Talks with the AngularJS ngElectron module.
 * Info: https://develephant.github.io/ngElectron
 * See also: https://develephant.gitgub.io/amy
 **/
var angularBridge = new Object();
var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;

angularBridge.send = function (msg, bw) {
    var msg = msg;
    bw = bw || BrowserWindow.getFocusedWindow();

    if (bw) {
        bw.webContents
            .send('ELECTRON_BRIDGE_CLIENT', msg);
    }
}

angularBridge.listen = function (_listener) {
    var i = require('electron').ipcMain;

    i.on('ELECTRON_BRIDGE_HOST', function (evt, msg) {
        console.log('ELECTRON_BRIDGE_HOST', msg);
        _listener(msg);
    });
}

module.exports = angularBridge;
