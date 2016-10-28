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




const log_stdout = process.stdout;
// prevent window being GC'd
let mainWindow = null;
console.log = function () { //
    var args = [],
        d = new Date(),
        timeStamp = "\[" + String(d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + ":" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()) + "\]:";

    args.push(timeStamp);

    for (var i in arguments) {
        args.push(util.format(arguments[i]));
    }


    // log_stdout.write(args.join(" ") + '\n');
    var insertScript = 'var string="' + (args.join(" ") + '\n') + '";console.log(string);';
    if(mainWindow)
    mainWindow.webContents.executeJavaScript(insertScript);
};


/***********************************************************************************************************************************************
 * START OF THE FUN
 **********************************************************************************************************************************************/




// Module to control application life.
const {app, remote, BrowserWindow, ipcMain, autoUpdater, electronScreen, Menu} = require('electron');


app.commandLine.appendSwitch('remote-debugging-port', '32400');


app.checkVersion = function () {
    autoUpdater.checkForUpdates();
};

autoUpdater.setFeedURL(updateFeed);
require('./auto-updator')(autoUpdater);


const cmd = args.parseArguments(app, process.argv.slice(1)).squirrelCommand;
console.log('cmd', cmd)



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

    console.log('startMainApplication');

    if (fs.existsSync(path.resolve(path.dirname(process.execPath), '..', 'update.exe')))
        app.checkVersion()

    createMainWindow()
}


// process.exit(0)

// if (process.platform === 'win32' && squirrel.handleCommand(app, cmd)) {
//     return
// }

