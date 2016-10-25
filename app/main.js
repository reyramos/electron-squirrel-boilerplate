'use strict';

//node js dependencies
let path = require('path'),
    ELECTON_REPO = __dirname.replace(/app\.asar/g, ''), //directory where to download everyfile to
    fs = require('fs'),
    version = function () {
        let readJson = function (path) {
            return JSON.parse(fs.readFileSync(path, 'utf8'))
        };
        //If the local machine contains a config app, lets load the environment specified, used for developers
        let userConfig = path.join(ELECTON_REPO, 'config.json'),
            buildConfig = path.join(__dirname, 'config.json'),
            devConfig = fs.existsSync(buildConfig) ? readJson(buildConfig) : require('../electron.config.js');

        let version = fs.existsSync(userConfig) ? Object.assign({}, readJson(buildConfig), readJson(userConfig)) : (fs.existsSync(buildConfig) ? readJson(buildConfig) : devConfig);

        return Object.assign({}, version);

    }(),
    uglify = require("uglify-js"),
    http = require('http'),
    util = require('util');



if(require('electron-squirrel-startup')) return;


const DOWNLOAD_DIR = path.join(process.env.USERPROFILE, 'Downloads');
const log_file = fs.existsSync(DOWNLOAD_DIR) ?
    fs.createWriteStream(path.join(DOWNLOAD_DIR, 'phoenix_debugger.log'), {flags: 'w'}) : fs.createWriteStream(path.join(ELECTON_REPO, 'phoenix_debugger.log'));

const log_stdout = process.stdout;

console.log = function () { //
    var args = [],
        d = new Date(),
        timeStamp = "\[" + String(d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + ":" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()) + "\]:";

    args.push(timeStamp);

    for (var i in arguments) {
        args.push(util.format(arguments[i]));
    }
    log_file.write(args.join(" ") + '\n');
    log_stdout.write(args.join(" ") + '\n');
};

/***********************************************************************************************************************************************
 * START OF THE FUN
 **********************************************************************************************************************************************/

// Module to control application life.
const {app, remote, BrowserWindow, ipcMain, autoUpdater} = require('electron');


var versionURL = "http://localhost/releases/win/v1.5.8.msi";
const appVersion = require('../package.json').version;
const os = require('os').platform();

console.log('appVersion', versionURL)
autoUpdater.setFeedURL(versionURL);


//require('crash-reporter').start();
app.setAppUserModelId(app.getName());


/*
 * Append an argument to Chromium’s command line. The argument will be quoted correctly.
 * http://peter.sh/experiments/chromium-command-line-switches/
 */
app.commandLine.appendSwitch('remote-debugging-port', '32400');
app.commandLine.appendArgument('disable-cache');
// //<https://github.com/scramjs/scram-engine/issues/5>
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-https-cache');

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
    splashScreen = null,
    oopsScreen = null;


//LISTENING EVENTS
let DidFailLoad = false,
    DidFinishLoad = false,
    DidStartLoading = false,
    DidFrameFinishLoad = false,
    DidStopLoading = false;


/**
 * Create the main Electron Application
 */
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
        return true;
    }
}).on('activate-with-no-open-windows', function () {
    if (!mainWindow) {
        startMainApplication();
    }
}).on('gpu-process-crashed', function () {
    if (mainWindow) {
        mainWindow.destroy();
    }
}).on('will-quit', function () {
    console.log('Goodbye');
}).on('ready', startMainApplication);





function createMainWindow(size) {
    let params = {
        width: size.width,
        height: size.height,
        resizable: true,
        icon: path.join(__dirname, 'icon.ico'),
        title: app.getName(),
        autoHideMenuBar: true,
        webPreferences: {
            webSecurity: false,
            allowDisplayingInsecureContent: true,
            allowRunningInsecureContent: true,
        }
    };

    let win = new BrowserWindow(params);


    win.loadURL(webUrl);

    console.log('DONE LOADING');

    win.on('closed', function () {
        mainWindow = null;
    });

    return new Promise(function (response) {
        response(win)
    });

}

function startMainApplication() {
    console.log('startMainApplication');

    var loadingSuccess = true;
    // var electronScreen = require('screen');
    const {screen: electronScreen} = require('electron');

    var size = electronScreen.getPrimaryDisplay().workAreaSize;

    createMainWindow(size).then(function (browserWindow) {

        mainWindow = browserWindow;

        mainWindow.webContents.on('did-start-loading', function (e) {
            DidStartLoading = true;
        });

        mainWindow.webContents.on('did-fail-load', function (e) {
            console.log('did-fail-load')
            DidFailLoad = true;
            mainWindow.hide();

        });

        /**
         * This is broadcast if the frame is refresh within the application
         * without electron interaction, we will re-inject the electronCode
         */
        mainWindow.webContents.on('did-frame-finish-load', function (e) {
            DidFrameFinishLoad = true;
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
            console.log('did-stop-loading:onComplete:');
            DidStopLoading = true;
        }
    });
}






