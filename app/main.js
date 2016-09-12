'use strict';

//node js dependencies
let path = require('path'),
    ELECTON_REPO = __dirname.replace(/app\.asar/g, ''), //directory where to download everyfile to
    fs = require('fs'),
    utilities = require('./libs/utilities'),
    version = function () {
        let readJson = function (path) {
            return JSON.parse(fs.readFileSync(path, 'utf8'))
        };
        //If the local machine contains a config app, lets load the environment specified, used for developers
        let userConfig = path.join(ELECTON_REPO, 'config.json'),
            buildConfig = path.join(__dirname, 'config.json'),
            devConfig = fs.existsSync(buildConfig) ? readJson(buildConfig) : require('../electron.config.js');

        let version = fs.existsSync(userConfig) ? Object.assign({}, readJson(buildConfig), readJson(userConfig)) : (fs.existsSync(buildConfig) ? readJson(buildConfig) : devConfig);

        return Object.assign({}, require('./libs/config'), version);

    }(),
    uglify = require("uglify-js"),
    http = require('http'),
    util = require('util');


const DOWNLOAD_DIR = path.join(process.env.HOME, 'Downloads');
const log_file = fs.existsSync(DOWNLOAD_DIR) ?
    fs.createWriteStream(path.join(DOWNLOAD_DIR, 'phoenix_debugger.log'), {flags: 'w'}) : fs.createWriteStream(path.join(ELECTON_REPO, 'phoenix_debugger.log'));

const log_stdout = process.stdout;

console.log = function () { //
    var args = [];
    for (var i in arguments) {
        args.push(util.format(arguments[i]));
    }
    log_file.write(args.join(" ") + '\n');
    log_stdout.write(args.join(" ") + '\n');
};


// Module to control application life.
const {app, remote, BrowserWindow, ipcMain} = require('electron');


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
//<https://github.com/scramjs/scram-engine/issues/5>
app.commandLine.appendSwitch('--disable-http-cache');
app.commandLine.appendSwitch('--disable-https-cache');

//app.setUserTasks([]);
app.clearRecentDocuments();


//This is to refesh the application while loading, to reloadIgnoringCache
let refresh = true;


//GET THE ENVIRONMENT VARIABLES TO CREATE,
//This url contains the version that is hosted on the remote server for package control
const releaseUrl = version["versionServer"];

let webUrl = function () {
    var string = version[version["startingEnvironment"]],
        re = new RegExp("__dirname", "g"),
        result = String(string).replace(re, __dirname);
    return result;
}();


// prevent window being GC'd
let mainWindow = null,
    splashScreen = null;

/**
 * Create the main Electron Application
 */
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        clearTempFiles();
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
    clearTempFiles();
}).on('ready', displaySplashScreen);


function displaySplashScreen() {

    /**
     * This is used to close the application and rendering process,
     * It will also terminate the process to allow
     * for user install
     */
    ipcMain.on('application-close-message', function (event, arg) {
        clearTempFiles();
        app.quit();
    });


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
        console.log('validate => ', version["startingEnvironment"])
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
        webPreferences: {
            webSecurity: false,
            allowDisplayingInsecureContent: true,
            allowRunningInsecureContent: true,
        }
    };

    let win = new BrowserWindow(params),
        parse = utilities.parse_url(webUrl);

    var appName = parse.scheme === 'file' ? webUrl : utilities.parse_url(webUrl).host.replace(/.labcorp.com/g, '');

    console.log('appName', appName)

    updateLoadingStatus(appName)

    console.log('createMainWindow => 101');
    win.loadURL(webUrl);

    console.log('DONE LOADING => 102');

    win.on('closed', function () {
        mainWindow = null;
    });

    return new Promise(function (response, reject) {
        win.webContents.on('did-finish-load', function (e) {
            console.log('did-finish-load', refresh);
            if (refresh) {
                refresh = false;
                win.webContents.reloadIgnoringCache()
                console.log('REFRESHING PATH => ', version["startingEnvironment"])
                response(win)
            }
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
                port: parse.port,
                method: 'GET',
                rejectUnauthorized: false,
                requestCert: true,
                agent: false,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': ''
                }
            };

        if (parse.scheme === 'file') {
            updateLoadingStatus("Status: 200");
            resolve(url)
        } else {


            let scheme = require(parse.scheme);

            var req = scheme.request(options, function (res) {
                console.log("statusCode: ", res.statusCode);
                updateLoadingStatus("Status: " + res.statusCode)

                return [500].indexOf(res.statusCode) === -1 ? resolve(url) : reject(url);

            }).on('error', function (e) {
                console.log('error:', e)
                reject(e);
            });

            req.end();

        }


    });
}


function updateLoadingStatus(msg, stop) {
    var insertScript = 'var s = document.querySelector( \'.status-text\' );s.innerHTML="' + msg + '";';

    if (stop)
        insertScript += "stop();";

    if (splashScreen) {
        console.log('=========updateLoadingStatus============\n', msg)
        splashScreen.webContents.executeJavaScript(insertScript);
    }


}

function LOAD_APPLICATION() {
    console.log('LOAD_APPLICATION => 200')
    updateLoadingStatus(version["startingEnvironment"]);

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

        /**
         * This is broadcast if the frame is refresh within the application
         * without electron interaction, we will re-inject the electronCode
         */
        mainWindow.webContents.on('did-frame-finish-load', function (e) {
            console.log('did-frame-finish-load');
            //next event => did-stop-loading will reload the necessary injections
            loadingSuccess = true;
        });


        /**
         * Once the web Application finish loading, lets inject
         * the ngElectron component, to be used within the webApp
         */
        mainWindow.webContents.on('did-stop-loading', onComplete);


        function onComplete(e) {

            //if it did not failed, lets hide the splashScreen and show the application
            if (!loadingSuccess)return;

            loadingSuccess = false;
            console.log('did-stop-loading');

            //insert the electron id indicator
            mainWindow.webContents.executeJavaScript("document.documentElement.setAttribute('id','ELECTRON_PARENT_CONTAINER');");

            //insert the electron bridge script
            electronInsertion();

            if (splashScreen) {
                updateLoadingStatus("Ready...")
                splashScreen.webContents.executeJavaScript('setTimeout(complete,1000);');
            }

            setTimeout(function () {
                if (splashScreen) {
                    splashScreen.close();//no longer needed
                    if (splashScreen) {
                        splashScreen.destroy();
                    }
                }
                mainWindow.show();
            }, 2000);


            /**
             * Set any IPC communication messages
             */
            utilities.walk(path.join(__dirname, 'ipc'), function (arr) {
                var services = {};

                for (var i in arr.files) {
                    utilities.extend(services, require(path.join(__dirname, 'ipc', arr.files[i])))
                }

                /**
                 * This builds the API structure for the IPC communication with
                 * electron and webview application
                 *
                 */
                bridge.listen(function (data) {
                    data.msg = services[data.eventType](process, data.msg);
                    bridge.send(data);
                });


            });

            //end of entry
        }
    });
}


function versionCompare() {

    utilities.getVersion(releaseUrl, function (status, obj) {
        if (status !== 200)return;
        var vrsCompare = utilities.versionCompare(obj.version, version.version),
            filePath = 'file://' + __dirname + '/dialogs/download.html?url=' + releaseUrl;// + '&id=' + (mainWindow.id ? String(mainWindow.id) : "");

        if (vrsCompare > 0) {
            var download = new BrowserWindow({
                width: 402,
                height: 152,
                resizable: false,
                alwaysOnTop: true,
                frame: false,
                title: app.getName(),
                'always-on-top': true,
                autoHideMenuBar: true
            });
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


    var host = utilities.parse_url(mainWindow.webContents.getURL()).host || '',
        appName = (host).replace(/.labcorp.com/g, '') || null,
        appName = appName ? ' - ' + appName.toUpperCase() : '';


    mainWindow.setTitle(app.getName() + appName);

    let insertScript = '!function(){if(document.querySelector(\'#electron-bridge\'))return; var s = document.createElement( \'script\' );s.id = \'electron-bridge\';var newContent = document.createTextNode(\'' + code + '\'),$parent=document.querySelector(\'body\');s.appendChild(newContent);$parent.insertBefore( s, $parent.querySelector(\'script\')); }();';
    mainWindow.webContents.executeJavaScript(insertScript);


    //this will inject the bootstrap if the URL does not have the bootstrap file indicator
    checkBootstrap(mainWindow.webContents.getURL());

}

function checkBootstrap(url) {
    var parse = utilities.parse_url(url),
        url = [parse.scheme, "://", parse.host, ":", parse.port, "/", "bootstrap.txt"].join("");

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    require(parse.scheme).get(url, function (res) {
        if (res.statusCode !== 200) {

            /***************************************************************
             * THIS HOTFIX IS TO BE REMOVE IN FUTURE RELEASES
             ***************************************************************/
            let hotFix = uglify.minify([__dirname + '/hotFixInjection.js']);


            let insertScript = '!function(){if(document.querySelector(\'#electron-object\'))return;var s = document.createElement( \'script\' );s.id = \'electron-object\';var newContent = document.createTextNode(\'' + hotFix.code + '\'),$parent=document.querySelector(\'body\');s.appendChild(newContent);$parent.appendChild( s ); }();';
            mainWindow.webContents.executeJavaScript(insertScript);
            mainWindow.webContents.executeJavaScript('angular.bootstrap(document, ["phxApp"]);');
            /***************************************************************
             * THE CODE ABOVE IS TO BE REMOVE IN FUTURE RELEASE OF QA ENVIRONMENT,
             * IT IS FOR THE INJECTION OF ELECTRON WITHIN THE ENVIRONMENT
             ***************************************************************/
        }

    });

}


/**
 clears up the temp files
 */
function clearTempFiles() {
    var _os = require('os'),
        tempFileRef = _os.tmpDir() + "/invoice.pdf";

    if (fs.existsSync(tempFileRef)) //only delete if file exist
        fs.unlink(tempFileRef);
}