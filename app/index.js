/**
 * Created by ramor11 on 10/26/2016.
 */
'use strict';

if (require('electron-squirrel-startup')) return;

const pkg = require('../package.json');
const fs = require('fs');

const appVersion = pkg.version;
const updateFeed = ["http://localhost:9000/updates/latest/", "?v=", appVersion].join("");


const args = require('./args');
const squirrel = require('./squirrel');


// Module to control application life.
const {app, remote, BrowserWindow, ipcMain, autoUpdater, electronScreen} = require('electron');

let manualCheck = false;
let updateAvailable = false;
let updateReady = false;


app.checkVersion = function (triggerManually) {
    manualCheck = triggerManually;
    autoUpdater.checkForUpdates();
};

autoUpdater.setFeedURL(updateFeed);

autoUpdater.on('error', function (err) {
    var msg = "An error has occurred while checking for updates " + err.message;
    console.log('error =>', msg)

    if (manualCheck) {
        // if (splashWindow) {
        //     splashWindow.webContents.send('update-error', msg);
        // } else if (mainWindow) {
        //     mainWindow.webContents.send('update-error', msg);
        // }
    }
});

autoUpdater.on('checking-for-update', function () {
    console.log('checking-for-update');
});

autoUpdater.on('update-available', function () {
    console.log('update-available')

    // if(splashWindow) {
    //     updateAvailable = true;
    //     isValid = true;
    //     splashWindow.close();
    // }
});

autoUpdater.on('update-not-available', function () {
    console.log('update-not-available')

    // if (mainWindow && manualCheck) {
    //     mainWindow.webContents.send('no-update');
    // } else if(splashWindow) {
    //     isValid = true;
    //     splashWindow.close();
    // }
});

autoUpdater.on('update-downloaded', function () {
    console.log('update-downloaded')

    // if(splashWindow) {
    //     splashWindow.webContents.send('update-ready');
    // } else if (mainWindow) {
    //     mainWindow.webContents.send('update-ready');
    // }
    updateReady = true;
});

// ipc.on('install', function() {
//     updateAvailable = false;
//     updateReady = false;
//     autoUpdater.quitAndInstall();
// });

// autoUpdater.checkForUpdates();
const cmd = args.parseArguments(app, process.argv.slice(1)).squirrelCommand;
console.log('cmd', cmd)

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
    return new Promise(function (response) {

        let params = {
            // width: size.width,
            // height: size.height,
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


        win.loadURL("https://reymundoramos.com/");

        console.log('DONE LOADING');

        win.on('closed', function () {
            mainWindow = null;
        });

        response(win)
    });

}

function startMainApplication() {
    console.log('startMainApplication');

    var loadingSuccess = true;

    if(fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe')))
    app.checkVersion()

    createMainWindow().then(function (browserWindow) {

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


// process.exit(0)

// if (process.platform === 'win32' && squirrel.handleCommand(app, cmd)) {
//     return
// }

