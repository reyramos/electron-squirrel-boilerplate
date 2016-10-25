/**
 * Created by ramor11 on 7/5/2016.
 */
let path = require('path'),
    fs = require('fs'),
    config = require("../electron.config.js"),
    helpers = require("./helpers"),
    rceditOpts = require('./rcedit.config.js'),
    shell = require('shelljs');
var electronInstaller = require('electron-winstaller');

var npmScripts = typeof (process.argv[2]) === 'undefined';


const APPLICATION_SRC = helpers.root(config.source);
const APP_BUILD_PATH = helpers.root(config.distribution, [config.execName, config.platform, config.arch].join("-"));


function parseStringCamelCase(string) {
    return String(string).replace(/([a-z](?=[A-Z]))/g, '$1-').replace(/([_])/g, ' ').trim().toLowerCase();
}

function parseStrinObject(obj) {
    Object.keys(obj).forEach(function (key) {
        if (typeof obj[key] === 'object') {
            obj[parseStringCamelCase(key)] = parseStrinObject(obj[key]);
        } else {
            obj[parseStringCamelCase(key)] = obj[key];
        }
    });

    return obj;
}


rceditOpts = parseStrinObject(rceditOpts);


let command = "\"./node_modules/.bin/electron-packager\"",
//build the command script based on config files
    _c = [
        command
        , APPLICATION_SRC
        , config.execName
        , "--platform=" + config.platform
        , "--arch=" + config.arch
        // , "--asar" //cant do asar file on squirrel
        , "--out=" + config.distribution
        , "--overwrite"
        , "--version=\"" + config.electronVersion + "\""
        , "--icon app/icon.ico"
    ];


/*
 * * win32 target platform only *
 * version-string     a list of sub-properties used to set the application metadata embedded into
 * the executable. They are specified via dot notation,
 */

let versionString = rceditOpts['version-string'];

Object.keys(versionString).forEach(function (key) {
    _c.push("--version-string." + key + "=\"" + versionString[key] + "\"")
});


//ICON PATH
_c.push("--icon=\"" + rceditOpts['icon'] + "\"");
//ELECTRON VERSION <https://github.com/electron/electron/releases>
if (config.electronVersion)
    _c.push("--version=\"" + config.electronVersion + "\"");


/*
 * * All platforms *
 */
_c.push("--app-copyright=\"" + rceditOpts['version-string']['LegalCopyright'] + "\"");
_c.push("--app-version=\"" + rceditOpts['version-string']['FileVersion'] + "\'");
_c.push("--build-version=\"" + rceditOpts['version-string']['ProductVersion'] + "\"");


// let electronVersion = shell.exec([command, '--version'].join(' '), {silent:true}).stdout.replace(/v/g, '');
// let electron_printer = helpers.root(APPLICATION_SRC, 'node_modules', 'electron-printer');
//
// if (fs.existsSync(electron_printer)) {
//     let printer_bin = [
//         "node-pre-gyp clean configure build",
//         "--target_arch=" + config.arch,
//         "--target_platform=" + config.platform,
//         "--runtime=electron",
//         "--target=" + config.electronVersion,
//         "--build-from-source && node-pre-gyp package",
//         "--target_arch=" + config.arch,
//         "--target_platform=" + config.platform,
//         "--runtime=electron",
//         "--target=" + config.electronVersion,
//         "--dist-url=https://atom.io/download/atom-shell"
//     ].join(" ");
//
//     if (npmScripts)shell.rm('-rf', path.join(APPLICATION_SRC, 'config.json'));
//     shell.cd(electron_printer);
//
//     if (shell.exec(printer_bin).code !== 0) {
//         console.log('Error: Failed to build electron-printer');
//     } else {
//         console.log('Build electron-printer');
//     }
//
// }

if (npmScripts) {

    let _command = _c.join(" ");

    console.log(_command);

    // fs.writeFile(path.join(APPLICATION_SRC, 'config.json'), JSON.stringify(config), function (err) {
    //     if (err) return console.log(err);
    //     shell.exec(_command);
    //
    //     //remove the file that we just created
    //     shell.rm('-rf', path.join(APPLICATION_SRC, 'config.json'));
    //
    //     //
    //     // let resultPromise = electronInstaller.createWindowsInstaller({
    //     //     appDirectory: APP_BUILD_PATH,
    //     //     outputDirectory: helpers.root(config.distribution, 'installer32'),
    //     //     authors: 'My App Inc.',
    //     //     exe: config.execName + '.exe'
    //     // });
    //     //
    //     // resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
    //
    //
    // });
}



