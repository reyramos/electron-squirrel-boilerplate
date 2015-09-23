'use strict';
const BrowserWindow = require('browser-window');
const Menu = require('menu');
const angular = require('./lib/ng-electron/ng-bridge');
const http = require("http");
const path = require('path');
const ipc = require('ipc');
const app = require('app');
const fs = require('fs');
const dialog = require('dialog');
const version = require('./version.json');
const MenuItem = require('menu-item');

const urlBuilds = "http://dev-eligibility-phoenix.labcorp.com/reyramos/builds/";


/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getVersion(callback) {
    http.get(urlBuilds + "build.json", function (res) {
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


function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
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
    console.log('Goodbye');
});

app.on('ready', function () {
    mainWindow = createMainWindow();
    mainWindow.webContents.on('dom-ready', function (e) {
        //try and manually bootstrap AngularJS
        //mainWindow.webContents.executeJavaScript(bootstrap);
    });

    mainWindow.openDevTools()
    mainWindow.webContents.on('did-finish-load', function (e) {

        setTimeout(function () {
            angular.send('hello from electron');
            getVersion(function (status, obj) {
                console.log('<====================================>');
                console.log('obj', obj);


                var vrsCompare = versionCompare(obj.version, version.version),
                    msi_file = 'v' + obj.version + '.msi',
                    options = {
                        title: 'Update Available',
                        type: 'info',
                        buttons: ['Ok', 'Cancel'],
                        message: 'Version ' + obj.version + ' available',
                        detail: obj.change_log || ''
                    },
                    downloadUrl = urlBuilds + msi_file;

                if (vrsCompare > 0)
                    dialog.showMessageBox(options, function (data) {
                        if (data === 0) {
                            var download = new BrowserWindow({
                                width: 200,
                                height: 100,
                                resizable: false,
                                icon: path.join(__dirname, 'icon.ico'),
                                title: 'Download',
                                'always-on-top': true
                            });

                            download.loadUrl(downloadUrl);
                            download.on('closed', function () {
                                download = null;
                            });
                        }
                    })
            });

        }, 500)


        //Start listening for client messages
        angular.listen(function (msg) {
            console.log('Client: ' + msg);
        });
    });
});
