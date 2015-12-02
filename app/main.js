'use strict';

let openDevTools = false;



require('web-contents');

const BrowserWindow = require('browser-window');
const Menu = require('menu');
const bridge = require('./ng-electron/ng-bridge');
const path = require('path');
const app = require('app');
const fs = require('fs');
const version = require('./version.json');
const utilities = require('./utilities');
const uglify = require("uglify-js");

//read the file as string and minify for code injection
let results = uglify.minify([__dirname + '/ng-electron/ng-electron-promise.js']);
//minify file
const code = results.code;
//This is to refesh the application while loading, to reloadIgnoringCache
let refresh = true;

//GET THE ENVIRONMENT VARIABLES TO CREATE,
//This url contains the version that is hosted on the remote server for package control
const releaseUrl = utilities.parse_url(version["VERSION_SERVER"]).scheme + '://' + utilities.parse_url(version["VERSION_SERVER"]).host + path.join(version.versionFilePath.replace(/\[WORKING_ENVIRONMENT\]/g, version['WORKING_ENVIRONMENT'].toLowerCase())).replace(/\\/g, '/');


//If the local machine contains a config app, lets load the environment specified, used for developers
let localFilePath = path.join(__dirname.replace(/app\.asar/g, ''), 'config.json'),
    localConfig = null;

//Allows for local path config file
if (fs.existsSync(localFilePath)) {
    localConfig = require(localFilePath);
}

let webUrl = (!localConfig ? version[version["WORKING_ENVIRONMENT"]] : localConfig.environment) + "?date=" + new Date().toJSON();
//load the required node js scheme
let http = require('http');


console.log('webUrl', webUrl)


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
        displaySplashScreen();
    }
}).on('will-quit', function () {
    console.log('<====================================>');
    console.log('Goodbye');
}).on('ready', displaySplashScreen);

function displaySplashScreen() {


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
    splashScreen.loadURL('file://' + __dirname + '/dialogs/spash-screen.html?');
    splashScreen.on('closed', function () {
        splashScreen = null;
    })

    splashScreen.webContents.on('did-finish-load', function () {
        validateURL(webUrl).then(LOAD_APPLICATION)
    });

}


/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
function getVersion(url, callback) {


    console.log('getVersion => ', url)


    require(utilities.parse_url(url).scheme).get(url, function (res) {

        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            try {
                var obj = JSON.parse(output);


                console.log('output => ', obj)

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

    function initialize() {
        let win = new BrowserWindow({
            width: size.width,
            height: size.height,
            resizable: true,
            show: false,
            icon: path.join(__dirname, 'icon.ico'),
            title: 'LabCorp Phoenix',
            webPreferences: {
                webSecurity: false
            }
        });
        console.log('createMainWindow => ', webUrl);
        win.loadURL(webUrl);
        win.openDevTools();
        win.on('closed', function () {
            mainWindow = null;
        });

        return win;

    }

    return new Promise(function (response, reject) {

        var temp = initialize(),
            returnWindow = null;

        temp.webContents.on('did-finish-load', function (e) {

            console.log('did-finish-load', refresh);


            temp.destroy();
            console.log('kill window => reopen')

            returnWindow = initialize();
            returnWindow.webContents.on('did-finish-load', function (e) {

                console.log('did-finish-load', refresh)

                if (refresh) {
                    refresh = false;
                    console.log('REFRESHING ULR => ', webUrl)

                    returnWindow.webContents.reloadIgnoringCache()
                    response(returnWindow)
                }
            })
        })
    });
}

function validateURL(url) {


    updateLoadinStatus("Validating Path ...")

    /**
     * Once the Splash Screen finish loading, check the version, start to load the application
     * in the background
     */

    return new Promise(function (fulfill, reject) {
        var parse = utilities.parse_url(url),
            options = {
                host: parse.host,
                port: parse.scheme === 'https' ? 443 : 80,
                method: 'GET',
                rejectUnauthorized: false,
                requestCert: true,
                agent: false
            };


        var req = require(parse.scheme).request(options, function (res) {
            console.log("statusCode: ", res.statusCode);
            console.log("headers: ", res.headers);

            updateLoadinStatus("Status: " + res.statusCode)

            var invalids = [500];
            webUrl = invalids.indexOf(res.statusCode) === -1 ? url : version[version["WORKING_ENVIRONMENT"]];


            console.log('webUrl', webUrl)

            fulfill(webUrl);


        });

        req.on('error', function (e) {
            console.log('error:', e)
            updateLoadinStatus("Validating Error:", true)

            fulfill(version[version["WORKING_ENVIRONMENT"]]);
        });

        req.end();


    });
}


function updateLoadinStatus(msg, stop) {
    var insertScript = 'var s = document.querySelector( \'.status-text\' );s.innerHTML="' + msg + '";';

    if (stop)
        insertScript += "stop();";

    if (splashScreen)
        splashScreen.webContents.executeJavaScript(insertScript);

    console.log('=====================')
    console.log(msg)

}

function LOAD_APPLICATION() {
    console.log('LOAD_APPLICATION => ' + webUrl)
    updateLoadinStatus(webUrl);


    console.log('splashScreen => did-finish-load')

    if (!mainWindow) {
        startMainApplication();
    }

    setTimeout(function () {

        getVersion(releaseUrl, function (status, obj) {

            var vrsCompare = utilities.versionCompare(obj.version, version.version),
                filePath = 'file://' + __dirname + '/dialogs/download.html?url=' + releaseUrl;

            if (vrsCompare > 0) {
                var download = new BrowserWindow({
                    width: 402,
                    height: 152,
                    resizable: false,
                    frame: false,
                    'always-on-top': true
                });

                console.log('filePath', filePath)

                download.loadURL(filePath);
                download.on('closed', function () {
                    download = null;
                });
            }
        });

    }, 500);

}


function startMainApplication() {
    var loadingSuccess = true;
    var electronScreen = require('screen');
    var size = electronScreen.getPrimaryDisplay().workAreaSize;

    updateLoadinStatus("Loading Application...");

    createMainWindow(size).then(function (browserWindow) {

        mainWindow = browserWindow;

        mainWindow.webContents.on('did-start-loading', function (e) {
            updateLoadinStatus("Loading Application...")
        });

        mainWindow.webContents.on('did-fail-load', function (e) {
            loadingSuccess = false;
            try {
                mainWindow.destroy();//no longer needed
            } catch (e) {
            }

            try {
                mainWindow.close();//no longer needed
            } catch (e) {
            }
            console.log('did-fail-load')

            updateLoadinStatus("Loading Application...", true)

        });

        /**
         * Once the web Application finish loading, lets inject
         * the ngElectron component, to be used within the webApp
         */
        mainWindow.webContents.on('did-stop-loading', function (e) {

            console.log('mainWindow => did-stop-loading');

            //var insertScript = '!function(){if(document.querySelector(\'#electron-bridge\'))return; var s = document.createElement( \'script\' );s.id = \'electron-bridge\';var newContent = document.createTextNode(\'' + code + '\'),$parent=document.querySelector(\'body\');s.appendChild(newContent);$parent.insertBefore( s, $parent.querySelector(\'script\')); }();';
            //mainWindow.webContents.executeJavaScript(insertScript);

        });

        /**
         * When the DOM is ready, lets add the ID to identify ELECTRON_PARENT_CONTAINER
         */
        mainWindow.webContents.on('dom-ready', function (e) {

            updateLoadinStatus("Ready...")


            console.log('mainWindow => dom-ready')
            mainWindow.webContents.executeJavaScript("document.documentElement.setAttribute('id','ELECTRON_PARENT_CONTAINER');");

        });


        //open the developer tools
        mainWindow.webContents.on('did-finish-load', function (e) {
            console.log('mainWindow => did-finish-loading')


            let insertScript = '!function(){if(document.querySelector(\'#electron-bridge\'))return; var s = document.createElement( \'script\' );s.id = \'electron-bridge\';var newContent = document.createTextNode(\'' + code + '\'),$parent=document.querySelector(\'body\');s.appendChild(newContent);$parent.insertBefore( s, $parent.querySelector(\'script\')); }();';
            mainWindow.webContents.executeJavaScript(insertScript);


            /***************************************************************
             * THIS HOTFIX IS TO BE REMOVE IN FUTURE RELEASES
             ***************************************************************/
            let hotFix = uglify.minify([__dirname + '/hotFixInjection.js']);

            insertScript = '!function(){var s = document.createElement( \'script\' );var newContent = document.createTextNode(\'' + hotFix.code + '\'),$parent=document.querySelector(\'body\');s.appendChild(newContent);$parent.appendChild( s ); }();';
            mainWindow.webContents.executeJavaScript(insertScript);
            mainWindow.webContents.executeJavaScript('angular.bootstrap(document, ["phxApp"]);');
            /***************************************************************
             * THE CODE ABOVE IS TO BE REMOVE IN FUTURE RELEASE OF QA ENVIRONMENT,
             * IT IS FOR THE INJECTION OF ELECTRON WITHIN THE ENVIRONMENT
             ***************************************************************/


            //if it did not failed, lets hide the splashScreen and show the application
            if (loadingSuccess) {
                //Electron Bug, when this is open, it injects the executeJavascript code, we are just gonna remove it
                //before we show the app
                if (!openDevTools)mainWindow.closeDevTools();
                updateLoadinStatus("Ready...")


                if (splashScreen)
                    splashScreen.webContents.executeJavaScript('setTimeout(complete,1000);');
                setTimeout(function () {
                    if (splashScreen) {
                        splashScreen.close();//no longer needed
                        splashScreen.destroy();
                    }


                    mainWindow.show();
                }, 2000);
            }

            bridge.listen(function (data) {
                console.log('listen', data)
                switch (data.eventType) {
                    case 'getVersion':
                        data.msg.version = version;
                        console.log('getVersion:', version)
                        bridge.send(data);
                        break;
                    default :
                        bridge.send(data);
                        break;

                }
            });
        });

    });
}
