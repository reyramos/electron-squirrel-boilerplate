/**
 * Created by ramor11 on 7/5/2016.
 */
let path = require('path'),
    fs = require('fs'),
    config = require("../electron.config.js"),
    shell = require('shelljs');

var npmScripts = typeof (process.argv[2]) === 'undefined';


const APPLICATION_SRC = path.join(path.dirname(__dirname), config.source);

let electron_printer = path.join(APPLICATION_SRC, 'node_modules', 'electron-printer');

let command = "\"./node_modules/.bin/electron-packager\" app/",
//build the command script based on config files
    _c = [
        command
        , "--platform=" + config.platform
        , "--arch=" + config.arch
        , "--asar"
        , "--out=" + config.distribution
        , "--overwrite"
        , "--version=\"" + config.electronVersion + "\""
    ];


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
    fs.writeFile(path.join(APPLICATION_SRC, 'config.json'), JSON.stringify(config), function (err) {
        if (err) return console.log(err);
        //back to root
        shell.cd(path.join(APPLICATION_SRC, '..'));
        shell.exec((_c.join(" ")));

        //remove the file that we just created
        shell.rm('-rf', path.join(APPLICATION_SRC, 'config.json'));

    });
}



