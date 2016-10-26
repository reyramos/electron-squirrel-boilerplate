/**
 * Created by ramor11 on 10/26/2016.
 */
'use strict';


if (require('electron-squirrel-startup')) return;
const pkg = require('../package.json');

const appVersion = pkg.version;
const updateFeed = ["http://localhost:9000/updates/latest/", "?v=", appVersion].join("");


const args = require('./args');
const squirrel = require('./squirrel');


// Module to control application life.
const {app, remote, BrowserWindow, ipcMain, autoUpdater} = require('electron');




autoUpdater.setFeedURL(updateFeed);
autoUpdater.checkForUpdates()
// const cmd = args.parseArguments(app, process.argv.slice(1)).squirrelCommand;
// console.log('cmd', cmd)





process.exit(0)

// if (process.platform === 'win32' && squirrel.handleCommand(app, cmd)) {
//     return
// }

