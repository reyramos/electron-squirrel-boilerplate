/**
 * Created by ramor11 on 10/26/2016.
 */
'use strict';

if (require('electron-squirrel-startup')) return;

const pkg = require('../package.json');
const fs = require('fs');
const path = require('path');
const util = require('util');

const appVersion = pkg.version;
const updateFeed = ["http://localhost:9000/updates/latest/", "?v=", appVersion].join("");


const args = require('./args');
const squirrel = require('./squirrel');


// prevent window being GC'd
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

let mainWindow = null;



// Module to control application life.
const {app, remote, BrowserWindow, ipcMain, autoUpdater, electronScreen, Menu} = require('electron');


app.commandLine.appendSwitch('remote-debugging-port', '32400');

/***********************************************************************************************************************************************
 * START OF THE MAIN PROCESS TO CHECK FOR VERSION
 **********************************************************************************************************************************************/

app.checkVersion = function () {
    autoUpdater.checkForUpdates();
};

autoUpdater.setFeedURL(updateFeed);
require('./auto-updator')(autoUpdater);

var handleStartupEvent = function() {
    if (process.platform !== 'win32') {
        return false;
    }

    var squirrelCommand = process.argv[1];

    console.log(squirrelCommand)

    switch (squirrelCommand) {
        case '--squirrel-install':
        case '--squirrel-updated':



            // Optionally do things such as:
            //
            // - Install desktop and start menu shortcuts
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Always quit when done
            app.quit();

            return true;
        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Always quit when done
            app.quit();

            return true;
        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated
            app.quit();
            return true;
    }
};

if (handleStartupEvent()) {
    return;
}

/***********************************************************************************************************************************************
 * START OF THE RENDERING PROCESS
 **********************************************************************************************************************************************/


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


function createMainWindow() {

    let params = {
        icon: path.join(__dirname, 'icon.ico'),
        title: app.getName()
    };

    mainWindow = new BrowserWindow(params);
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on('closed', function () {
        mainWindow = null;
    });


}

function startMainApplication() {
    const {app, Menu} = require('electron')

    const template = [
        {
            label: 'About',
            submenu: [
                {
                    label: 'Check for Updates ',
                    role: 'Check for Updates ',
                    click (item, focusedWindow) {
                        app.checkVersion()
                    }
                }
            ]
        }
    ];


    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    if (fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe')))app.checkVersion();

    createMainWindow();
}

