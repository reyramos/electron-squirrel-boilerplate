/**
 * Created by ramor11 on 7/5/2016.
 */
let fs = require('fs'),
    config = require("../electron.config.js"),
    helpers = require("./helpers"),
    shell = require('shelljs');


let command = "\"./node_modules/.bin/electron\"",

//build the command script based on config files
    _c = [
        command
        , "."
        , "--version=\"" + config.electronVersion + "\""

    ];

// let electronVersion = shell.exec([command, '--version'].join(' '), {silent:true}).stdout.replace(/v/g, '');
// let electron_printer = helpers.root(APPLICATION_SRC, 'node_modules', 'electron-printer');
//
// if (fs.existsSync(electron_printer)) {
//     // shell.rm('-rf', path.join(APPLICATION_SRC, 'config.json'));
//     // shell.cd(electron_printer);
//     //
//     //
//     // let printer_bin = [
//     //     "node-pre-gyp clean configure build",
//     //     "--target_arch=" + process.arch, //x64
//     //     "--target_platform=" + process.platform,
//     //     "--runtime=electron",
//     //     "--target=" + electronVersion,
//     //     "--build-from-source && node-pre-gyp package",
//     //     "--target_arch=" + process.arch, //x64
//     //     "--=target_platform=" + process.platform,
//     //     "--runtime=electron",
//     //     "--target=" + electronVersion,
//     //     "--dist-url=https://atom.io/download/atom-shell"
//     // ].join(" ");
//     //
//     //
//     //
//     // if (shell.exec(printer_bin).code !== 0) {
//     //     console.log('Error: Failed to build electron-printer');
//     // } else {
//     //     console.log('Build electron-printer');
//     // }
//
// }

//back to root
// shell.cd(helpers.root());

shell.exec((_c.join(" ")));