let path = require('path'),
    fs = require('fs'),
    utilities = require('../app/libs/utilities.js'),
    config = require("../electron.config.js"),
    rceditOpts = require('./rcedit.config.js'),
    shell = require('shelljs');


// module.exports = function (grunt, arg) {


var done = function () {
};//this.async();
config['build_date'] = new Date().toJSON();

/*
 * Documentation for electron-packager
 * https://github.com/electron-userland/electron-packager/blob/master/usage.txt
 *
 */
let command = "./node_modules/.bin/electron-packager app/ --platform=win32 --arch=ia32 --asar --out=build --overwrite",
    _c = [command];

/*
 * * win32 target platform only *
 * version-string     a list of sub-properties used to set the application metadata embedded into
 * the executable. They are specified via dot notation,
 */


Object.keys(rceditOpts['version-string']).forEach(function (key) {
    _c.push("--version-string." + key + "='" + rceditOpts['version-string'][key] + "'")
});

/*
 * ICON PATH
 */
_c.push("--icon='" + rceditOpts['icon'] + "'")

/*
 * * All platforms *
 */
_c.push("--app-copyright='" + rceditOpts['version-string']['LegalCopyright'] + "'")
_c.push("--app-version='" + rceditOpts['version-string']['FileVersion'] + "'")
_c.push("--build-version='" + rceditOpts['version-string']['ProductVersion'] + "'")


const APP_VERSION = String(config.version).trim() || false;
const APPLICATION_SRC = path.join(config.source);
const DEVELOPMENT_SRC = path.join(config.development);

const RELEASE = utilities.parse_url(config["VERSION_SERVER"]).scheme + '://' + utilities.parse_url(config["VERSION_SERVER"]).host + path.join(config.versionFilePath.replace(/\[WORKING_ENVIRONMENT\]/g, config['WORKING_ENVIRONMENT'].toLowerCase())).replace(/\\/g, '/');

/*******************************************************************
 APPLICATION VARIABLES
 *******************************************************************/

/**
 * This functionality is to check if the build.json file exist, if it exist it will check if the version is already created.
 * So it will force the developer to upgrade their version for the new build
 */

utilities.getVersion(RELEASE, function (status, obj) {

    const BUILD_VERSION = String(obj.version).trim() || false;
    var vrsCompare = utilities.versionCompare(APP_VERSION, BUILD_VERSION);
    if (vrsCompare > 0) {

        // create the versioning file
        if (fs.existsSync(APPLICATION_SRC)) {
            utilities.file_put_content(path.join(APPLICATION_SRC, 'version.json'), JSON.stringify(config));
        }

        if (fs.existsSync(DEVELOPMENT_SRC)) {
            utilities.file_put_content(path.join(DEVELOPMENT_SRC, 'version.json'), JSON.stringify(config));
        }


        var command = (_c.join(" "));
        console.log('command',command)


        //    shell.exec(command, function(code, stdout, stderr) {
        //     if(stderr){
        //         console.log('Program stderr:', stderr);
        //         done(false);
        //     }else if(stdout){
        //         console.log(stdout);
        //         // grunt.task.run(['msi-build']);
        //         done(true);
        //     }
        // });


    } else {
        console.log('\n\nUPDATE YOUR VERSION FILE, VERSION:' + APP_VERSION + ' ALREADY EXIST');
        done(false);
    }
}, function (error) {
    done(false);
    console.log(error);
});

// };
