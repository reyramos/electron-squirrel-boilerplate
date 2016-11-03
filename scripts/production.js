/**
 * Created by ramor11 on 7/5/2016.
 */
let config = require("../electron.config.js"),
    helpers = require("./helpers"),
    rceditOpts = require('./rcedit.config.js'),
    shell = require('shelljs'),
    package = require("../package.json"),
    electronInstaller = require('electron-winstaller');

const APP_BUILD_PATH = helpers.root(config.distribution, [package.name, config.platform, config.arch].join("-"));


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
        , "."
        , package.name
        , "--platform=" + config.platform
        , "--arch=" + config.arch
        , "--out=" + config.distribution
        , "--overwrite"
        , "--version=\"" + config.electronVersion + "\""
        , "--prune" //this will not include all the devDependencies from package
    ];


['.idea', '\\.git(ignore|modules)', 'scripts', 'server', 'build'].forEach(function (k) {
    _c.push("--ignore=\"" + k + "\"")
});

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

/*
 * * All platforms *
 */
_c.push("--app-copyright=\"" + rceditOpts['version-string']['LegalCopyright'] + "\"");
_c.push("--app-version=\"" + rceditOpts['version-string']['FileVersion'] + "\"");
_c.push("--build-version=\"" + rceditOpts['version-string']['ProductVersion'] + "\"");


let _command = _c.join(" ");

shell.exec(_command, function (code) {
    if (code !== 0)return;

    let resultPromise = electronInstaller.createWindowsInstaller({
        appDirectory: APP_BUILD_PATH,
        outputDirectory: helpers.root(config.distribution, 'releases', package.version),
        iconUrl: rceditOpts['icon'],
        setupIcon: rceditOpts['icon'],
        noMsi: true
    });

    resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
});






