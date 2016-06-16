'use strict';

//node js dependencies
let path = require('path'),
    fs = require('fs'),
    version = function () {
        //If the local machine contains a config app, lets load the environment specified, used for developers
        let localFilePath = path.join(__dirname.replace(/app\.asar/g, ''), 'config.json'),
        //Allows for local path config file
            localConfig = fs.existsSync(localFilePath) ? localFilePath : path.join(__dirname, 'version.json'),
            version = fs.existsSync(localConfig) ? JSON.parse(fs.readFileSync(localConfig, 'utf8')) : require('../electron.config.js');


        return version;
    }(),
    utilities = require('./libs/utilities'),
    uglify = require("uglify-js"),
    http = require('http');

// Module to control application life.
const {app, remote, BrowserWindow, Menu, MenuItem, Tray, globalShortcut} = require('electron');


//read the file as string and minify for code injection
const code = uglify.minify([path.join(__dirname, 'libs', 'ng-electron-promise.js')]).code;

/*
 * bridge to send command from webview to electron application
 * this will allow the webapplication to define electron controlls without the need
 * to apply changes to app/main.js
 */
const bridge = require('./libs/ng-bridge');


//require('crash-reporter').start();
app.setAppUserModelId(app.getName());

/*
 * Append an argument to Chromium’s command line. The argument will be quoted correctly.
 * http://peter.sh/experiments/chromium-command-line-switches/
 */
app.commandLine.appendSwitch('remote-debugging-port', '32400');
app.commandLine.appendArgument('--disable-cache');

//app.setUserTasks([]);
app.clearRecentDocuments();


//This is to refesh the application while loading, to reloadIgnoringCache
let refresh = true;

//GET THE ENVIRONMENT VARIABLES TO CREATE,
//This url contains the version that is hosted on the remote server for package control
const releaseUrl = utilities.parse_url(version["VERSION_SERVER"]).scheme + '://' + utilities.parse_url(version["VERSION_SERVER"]).host + path.join(version.versionFilePath.replace(/\[WORKING_ENVIRONMENT\]/g, version['WORKING_ENVIRONMENT'].toLowerCase())).replace(/\\/g, '/');


let webUrl = version[version["WORKING_ENVIRONMENT"]];// (!localConfig ? version[version["WORKING_ENVIRONMENT"]] : localConfig.environment);

// prevent window being GC'd
let mainWindow = null,
    splashScreen = null;

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
}).on('gpu-process-crashed', function () {
    if (mainWindow) {
        mainWindow.destroy();
    }
}).on('will-quit', function () {
    console.log('<====================================>');
    console.log('Goodbye');
}).on('ready', displaySplashScreen);


function displaySplashScreen() {

    /*
     * Remove this globalShortcut, use port debugger to
     * debug electron application
     */
    //globalShortcut.register('ctrl+d', function () {
    //    if (mainWindow) {
    //        mainWindow.toggleDevTools()
    //    }
    //});

    /**
     * Build the Splash Screen
     */
    splashScreen = new BrowserWindow({
        width: 602,
        height: 502,
        resizable: false,
        transparent: true,
        frame: false,
        title: app.getName(),
        autoHideMenuBar: true,
        'always-on-top': true
    });
    splashScreen.loadURL('file://' + __dirname + '/dialogs/spash-screen.html?');
    splashScreen.on('closed', function () {
        splashScreen = null;
    });

    splashScreen.webContents.on('did-finish-load', function () {
        console.log('validate => ', webUrl)
        validateURL(webUrl).then(LOAD_APPLICATION, function (e) {
            updateLoadingStatus("Validating Error: " + e.errno, true);
            setTimeout(app.quit, 5000);
        })
    });

}


function createMainWindow(size) {
    let params = {
        width: size.width,
        height: size.height,
        resizable: true,
        show: false,
        icon: path.join(__dirname, 'icon.ico'),
        title: app.getName(),
        autoHideMenuBar: true,
        // frame: false,
        // webPreferences: {
        //     webSecurity: false
        // }
    };

    console.log('params => ', params);


    let win = new BrowserWindow(params);

    var appName = utilities.parse_url(webUrl).host.replace(/.labcorp.com/g, '');

    updateLoadingStatus(appName)

    console.log('createMainWindow => ', webUrl);
    win.loadURL(webUrl);

    console.log('DONE LOADING URL => ', webUrl);

    win.on('closed', function () {
        mainWindow = null;
    });


    return new Promise(function (response, reject) {
        win.webContents.on('did-finish-load', function (e) {
            response(win)
        })
    });
}


function validateURL(url) {


    updateLoadingStatus("Validating Path ...")

    /**
     * Once the Splash Screen finish loading, check the version, start to load the application
     * in the background
     */

    return new Promise(function (resolve, reject) {
        var parse = utilities.parse_url(url),
            options = {
                host: parse.host,
                // port: parse.scheme === 'https' ? 443 : 80,
                // method: 'GET',
                // rejectUnauthorized: false,
                // requestCert: true,
                // agent: false
                // headers: {
                //     'Content-Type': 'application/x-www-form-urlencoded',
                //     'Content-Length': ''
                // }
            };

        let scheme = require(parse.scheme);

        var req = scheme.request(options, function (res) {

            console.log("statusCode: ", res.statusCode);
            console.log("headers: ", res.headers);

            updateLoadingStatus("Status: " + res.statusCode)

            return [500].indexOf(res.statusCode) === -1 ? resolve(url) : reject(url);

        }).on('error', function (e) {
            console.log('error:', e)
            reject(e);
        });

        req.end();


    });
}


function updateLoadingStatus(msg, stop) {
    var insertScript = 'var s = document.querySelector( \'.status-text\' );s.innerHTML="' + msg + '";';

    if (stop)
        insertScript += "stop();";

    if (splashScreen)
        splashScreen.webContents.executeJavaScript(insertScript);

    console.log('=========updateLoadingStatus============\n', msg)

}

function LOAD_APPLICATION() {
    console.log('LOAD_APPLICATION => ' + webUrl)
    updateLoadingStatus(webUrl);

    if (!mainWindow) {
        startMainApplication();
    }

}

function startMainApplication() {
    var loadingSuccess = true;
    // var electronScreen = require('screen');
    const {screen: electronScreen} = require('electron');

    var size = electronScreen.getPrimaryDisplay().workAreaSize;

    updateLoadingStatus("Loading Application...");

    console.log('size', size)

    createMainWindow(size).then(function (browserWindow) {

        console.log('OPENING APPLICATION')
        setTimeout(versionCompare, 500);

        mainWindow = browserWindow;

        mainWindow.webContents.on('did-start-loading', function (e) {
            updateLoadingStatus("Loading Application...")
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
            updateLoadingStatus("Failed to load ...", true)
        });

        //Application is no longer broadcasting these events
        // /**
        //  * When the DOM is ready, lets add the ID to identify ELECTRON_PARENT_CONTAINER
        //  */
        // mainWindow.webContents.on('dom-ready', function (e) {
        //     // updateLoadingStatus("Ready...")
        //     console.log('dom-ready')
        //
        // });
        //
        //
        // //open the developer tools
        // mainWindow.webContents.on('did-finish-load', function (e) {
        //     console.log('mainWindow => did-finish-load')
        //
        // });
        //
        //
        // mainWindow.webContents.on('did-frame-finish-load', function (e) {
        //     console.log('did-frame-finish-load');
        //     // updateLoadingStatus("Ready...");
        //     // electronInsertion();
        // });


        /**
         * Once the web Application finish loading, lets inject
         * the ngElectron component, to be used within the webApp
         */
        mainWindow.webContents.on('did-stop-loading', onComplete);


        function onComplete(e) {
            console.log('did-stop-loading');

            //if it did not failed, lets hide the splashScreen and show the application
            if (loadingSuccess) {

                mainWindow.webContents.executeJavaScript("document.documentElement.setAttribute('id','ELECTRON_PARENT_CONTAINER');");

                loadingSuccess = false;

                electronInsertion();


                updateLoadingStatus("Ready...")


                if (splashScreen)
                    splashScreen.webContents.executeJavaScript('setTimeout(complete,1000);');

                setTimeout(function () {
                    if (splashScreen) {
                        splashScreen.close();//no longer needed
                        if (splashScreen) {
                            splashScreen.destroy();
                        }
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
        }


    });

}


function versionCompare() {
    console.log('check release version => ', releaseUrl)


    utilities.getVersion(releaseUrl, function (status, obj) {


        if (status !== 200)return;


        var vrsCompare = utilities.versionCompare(obj.version, version.version),
            filePath = 'file://' + __dirname + '/dialogs/download.html?url=' + releaseUrl; //+ '&id=' + (mainWindow.id ? String(mainWindow.id) : "");

        if (vrsCompare > 0) {
            var download = new BrowserWindow({
                width: 402,
                height: 152,
                resizable: false,
                frame: false,
                title: app.getName(),
                'always-on-top': true,
                autoHideMenuBar: true
            });

            console.log('filePath', filePath)

            download.loadURL(filePath);
            download.on('closed', function () {
                download = null;
            });
        }
    });
}

/**
 * Function to insert Electron, and Node objects onto the DOM element.
 */
function electronInsertion() {

    var appName = utilities.parse_url(mainWindow.webContents.getURL()).host.replace(/.labcorp.com/g, ''),
        appName = appName ? ' - ' + appName.toUpperCase() : '';

    mainWindow.setTitle(app.getName() + appName);
    //mainWindow.setSkipTaskbar(true)

    let insertScript = '!function(){if(document.querySelector(\'#electron-bridge\'))return; var s = document.createElement( \'script\' );s.id = \'electron-bridge\';var newContent = document.createTextNode(\'' + code + '\'),$parent=document.querySelector(\'body\');s.appendChild(newContent);$parent.insertBefore( s, $parent.querySelector(\'script\')); }();';
    mainWindow.webContents.executeJavaScript(insertScript);
}

