var path = require('path'),
    fs = require('fs'),
    utilities = require('./app/libs/utilities.js'),
    rceditOpts = require('./rcedit.config.js'),
    config = require("./electron.config.js");


config['build_date'] = new Date().toJSON();


const APP_NAME = config.app_name;
const APP_DESCRIPTION = config.app_description;
const MANUFACTURER = config.manufacturer;
const APP_VERSION = String(config.version).trim() || false;
const APPLICATION_SRC = path.join(__dirname, config.source);
const DEVELOPMENT_SRC = path.join(__dirname, config.development);
const BUILD_DESTINATION = path.join(__dirname, config.distribution);

const RELEASE = utilities.parse_url(config["VERSION_SERVER"]).scheme + '://' + utilities.parse_url(config["VERSION_SERVER"]).host + path.join(config.versionFilePath.replace(/\[WORKING_ENVIRONMENT\]/g, config['WORKING_ENVIRONMENT'].toLowerCase())).replace(/\\/g, '/');


//searches for icon.png file in the application src to set the Add/Remove icon
var APPLICATION_ICON_SOURCE = path.join(APPLICATION_SRC, 'icon.ico');

//path to electron files
const ELECTRON_PATH = path.join(__dirname, config.electron_build);
const ELECTRON_BUILD_DESTINATION = path.join(ELECTRON_PATH, '/resources/app.asar');


var ELECTRON_EXE_DESTINATION = path.join(ELECTRON_PATH, config.exeName + '.exe');

fs.rename(path.join(ELECTRON_PATH, 'electron.exe'), ELECTRON_EXE_DESTINATION, function (err) {
});


console.log('RELEASE', RELEASE)
console.log('DEVELOPMENT_SRC', DEVELOPMENT_SRC)
console.log('APPLICATION_SRC', APPLICATION_SRC)
console.log('ELECTRON_BUILD_DESTINATION', ELECTRON_BUILD_DESTINATION)

/*******************************************************************
 APPLICATION VARIABLES
 *******************************************************************/

var rcedit = require('rcedit'),
    asar = require('asar'); //create electron build from the application source files


/**
 * This functionality is to check if the build.json file exist, if it exist it will check if the version is already created.
 * So it will force the developer to upgrade their version for the new build
 */

utilities.getVersion(RELEASE, function (status, obj) {

    console.log('VERSION => ', obj)

//create the versioning file
    if (fs.existsSync(APPLICATION_SRC)) {
        utilities.file_put_content(path.join(APPLICATION_SRC, 'version.json'), JSON.stringify(config));
    }
    if (fs.existsSync(DEVELOPMENT_SRC)) {
        utilities.file_put_content(path.join(DEVELOPMENT_SRC, 'version.json'), JSON.stringify(config));
    }

    const BUILD_VERSION = String(obj.version).trim() || false;
    var vrsCompare = utilities.versionCompare(APP_VERSION, BUILD_VERSION);
    if (vrsCompare > 0) {


        rcedit(ELECTRON_EXE_DESTINATION, rceditOpts, function (error) {
            if (error)
                console.error(error)
            createPackage();
        });


    } else {
        console.log('\n\nUPDATE YOUR VERSION FILE, VERSION:' + APP_VERSION + ' ALREADY EXIST');
    }

});


function createPackage() {
    //make the directory for the
    utilities.mkdir(BUILD_DESTINATION);
    asar.createPackage(APPLICATION_SRC, ELECTRON_BUILD_DESTINATION, function () {
        console.log('Electron Package Created');
    });
}




