'use strict';

const BrowserWindow = require('browser-window');
const Menu = require('menu');
const angular = require('./ng-electron/ng-bridge');
const path = require('path');
const ipc = require('ipc');
const app = require('app');
const fs = require('fs');
const version = require('./version.json');
const MenuItem = require('menu-item');
const utilities = require('./utilities');
const code = String(fs.readFileSync(__dirname + '/ng-electron/ng-electron-promise.min.js', 'utf8')).replace(/APP_MODULE_NAME/g, version.ngModuleName);

//GET THE ENVIRONMENT VARIABLES TO CREATE,
//This url contains the version that is hosted on the remote server for package control
const releaseUrl = utilities.parse_url(version["DEV"]).scheme + '://' + utilities.parse_url(version["DEV"]).host + path.join(version.versionFilePath.replace(/\[WORKING_ENVIRONMENT\]/g, version['WORKING_ENVIRONMENT'].toLowerCase())).replace(/\\/g, '/');


//If the local machine contains a config app, lets load the environment specified, used for developers
let localFilePath = path.join(__dirname.replace(/app\.asar/g, ''), 'config.json'),
    localConfig = null;

//Allows for local path config file
if (fs.existsSync(localFilePath)) {
    localConfig = require(localFilePath);
}

let webUrl = !localConfig ? version[version["WORKING_ENVIRONMENT"]] : localConfig.environment;
//load the required node js scheme
let http = require('http');

// prevent window being GC'd
let mainWindow = null;
let splashScreen = null;


/**
 * Create the main Electron Application
 */
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}).on('activate-with-no-open-windows', function () {
    if (!mainWindow) {
        validateURL(webUrl).then(LOAD_APPLICATION)
    }
}).on('will-quit', function () {
    console.log('<====================================>');
    console.log('Goodbye');
}).on('ready', function () {
    validateURL(webUrl).then(LOAD_APPLICATION)
});


/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getVersion(url, callback) {

    require(utilities.parse_url(url).scheme).get(url, function (res) {

        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            try {
                var obj = JSON.parse(output);
                callback(res.statusCode, obj);
            } catch (e) {
            }

        });

    }).on('error', function (e) {
        //callback(e);
        console.log('error', e)

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

    console.log('webUrl', webUrl);
    win.loadUrl(webUrl);
    //win.loadUrl('file://' + __dirname + '/index.html');

    win.on('closed', function () {
        mainWindow = null;
    });

    return win;

}

function validateURL(url) {

    function _finally(url) {
        //update variables
        webUrl = url;
        http = require(utilities.parse_url(url).scheme);
        return url;
    }


    return new Promise(function (fulfill, reject) {
        require(utilities.parse_url(url).scheme).get(url, function (res) {
            webUrl = res.statusCode === 200 ? url : version[version["WORKING_ENVIRONMENT"]];
            fulfill(_finally(webUrl));
        }).on('error', function (e) {
            fulfill(_finally(version[version["WORKING_ENVIRONMENT"]]));
        });
    });
}

function LOAD_APPLICATION() {
    var electronScreen = require('screen');
    var size = electronScreen.getPrimaryDisplay().workAreaSize;


    /**
     * Build the Splash Screen
     */
    splashScreen = new BrowserWindow({
        width: 602,
        height: 502,
        resizable: false,
        transparent: true,
        frame: false,
        'always-on-top': true
    });
    splashScreen.loadUrl('file://' + __dirname + '/dialogs/spash-screen.html?');
    splashScreen.on('closed', function () {
        splashScreen = null;
    })

    /**
     * Once the Splash Screen finish loading, check the version, start to load the application
     * in the background
     */
    splashScreen.webContents.on('did-finish-load', function (e) {

        if (!mainWindow) {
            startMainApplication();
        }

        setTimeout(function () {
            getVersion(releaseUrl, function (status, obj) {
                var vrsCompare = utilities.versionCompare(obj.version, version.version);
                if (vrsCompare > 0) {
                    var download = new BrowserWindow({
                        width: 402,
                        height: 152,
                        resizable: false,
                        frame: false,
                        'always-on-top': true
                    });
                    download.loadUrl('file://' + __dirname + '/dialogs/download.html?version=' + obj.version + '&id=' + mainWindow.id);
                    download.on('closed', function () {
                        download = null;
                    });
                }
            });

        }, 500);
    });


    function startMainApplication() {
        var loadingSuccess = true;

        mainWindow = createMainWindow(size);

        mainWindow.webContents.on('did-start-loading', function (e) {
            //var insertScript = 'var s = document.querySelector( \'.message\' );s.innerHTML="Loading ...";';
            //splashScreen.webContents.executeJavaScript(insertScript);
        });

        mainWindow.webContents.on('did-fail-load', function (e) {
            var insertScript = 'stop();';
            splashScreen.webContents.executeJavaScript(insertScript);
            loadingSuccess = false;
            mainWindow.close();//no longer needed
            console.log('did-fail-load')
        });

        mainWindow.webContents.on('did-stop-loading', function (e) {

            //if it did not load

            console.log('did-stop-loading')

        });

        mainWindow.webContents.on('dom-ready', function (e) {
            console.log('dom-ready')
            mainWindow.webContents.executeJavaScript("document.documentElement.setAttribute('id','ELECTRON_PARENT_CONTAINER');");
        });


        //open the developer tools
        //mainWindow.openDevTools();
        mainWindow.webContents.on('did-finish-load', function (e) {
            console.log('did-finish-loading')

            var insertScript = '!function(){var s = document.createElement( \'script\' );var newContent = document.createTextNode(\'' + code + '\');s.appendChild(newContent);document.body.appendChild( s );angular.bootstrap(document, [\'' + version.ngModuleName + '\']);}()';

            mainWindow.webContents.executeJavaScript(insertScript);

            //if it did not failed, lets hide the splashScreen and show the application
            if (loadingSuccess) {

                if (splashScreen)
                    splashScreen.webContents.executeJavaScript('setTimeout(complete,1000);');

                setTimeout(function () {

                    if (splashScreen)
                        splashScreen.close();//no longer needed

                    mainWindow.show();
                }, 2000);

            }

            angular.listen(function (data) {

                switch (data.eventType) {
                    case 'getVersion':
                        getVersion(releaseUrl, function (status, obj) {
                            data.msg.version = obj;
                            angular.send(data);
                        });
                        break;
                    default :
                        angular.send(data);
                        break;

                }

            });
        });

    }
}


