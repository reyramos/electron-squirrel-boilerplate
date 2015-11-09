var path = require('path'),
    fs = require('fs'),
    utilities = require('./app/utilities.js'),
    config = require("./electron.config.js");


config['build_date'] = new Date().toJSON();


const APP_NAME = config.app_name;
const APP_DESCRIPTION = config.app_description;
const MANUFACTURER = config.manufacturer;
const APP_VERSION = String(config.version).trim() || false;
const APPLICATION_SRC = path.join(__dirname, config.source);
const DEVELOPMENT_SRC = path.join(__dirname, config.development);
const BUILD_DESTINATION = path.join(__dirname, config.distribution);

const RELEASE = utilities.parse_url(config["DEV"]).scheme + '://' + utilities.parse_url(config["DEV"]).host + path.join(config.versionFilePath.replace(/\[WORKING_ENVIRONMENT\]/g,config['WORKING_ENVIRONMENT'].toLowerCase())).replace(/\\/g, '/');


//searches for icon.png file in the application src to set the Add/Remove icon
var APPLICATION_ICON_SOURCE = path.join(APPLICATION_SRC, 'icon.ico');

//path to electron files
const ELECTRON_PATH = path.join(__dirname, config.electron_build);
const ELECTRON_BUILD_DESTINATION = path.join(ELECTRON_PATH, '/resources/app.asar');

var ELECTRON_EXE_DESTINATION = fs.existsSync(path.join(ELECTRON_PATH, 'electron.exe')) ? path.join(ELECTRON_PATH, 'electron.exe') : "";

console.log('RELEASE', RELEASE)
console.log('DEVELOPMENT_SRC', DEVELOPMENT_SRC)
console.log('APPLICATION_SRC', APPLICATION_SRC)
console.log('ELECTRON_BUILD_DESTINATION', ELECTRON_BUILD_DESTINATION)

/*******************************************************************
 APPLICATION VARIABLES
 *******************************************************************/

var rcedit = require('rcedit'),
    asar = require('asar'); //create electron build from the application source files


//create the versioning file
if (fs.existsSync(APPLICATION_SRC)) {
    file_put_content(path.join(APPLICATION_SRC, 'version.json'), JSON.stringify(config));
}
if (fs.existsSync(DEVELOPMENT_SRC)) {
    file_put_content(path.join(DEVELOPMENT_SRC, 'version.json'), JSON.stringify(config));
}


/**
 * This functionality is to check if the build.json file exist, if it exist it will check if the version is already created.
 * So it will force the developer to upgrade their version for the new build
 */

utilities.getVersion(RELEASE, function (status, obj) {

    console.log('VERSION => ', obj)


    const BUILD_VERSION = String(obj.version).trim() || false;
    var vrsCompare = utilities.versionCompare(APP_VERSION, BUILD_VERSION);
    if (vrsCompare > 0) {
        rcedit(ELECTRON_EXE_DESTINATION, {
            'version-string': APP_DESCRIPTION,
            'file-version': APP_VERSION,
            'product-version': APP_VERSION,
            'product-name': APP_NAME,
            'icon': path.join(APPLICATION_SRC, 'icon.ico')
        }, function (error) {
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
    mkdir(BUILD_DESTINATION);
    asar.createPackage(APPLICATION_SRC, ELECTRON_BUILD_DESTINATION, function () {
        console.log('Electron Package Created');
    });
}

function file_put_content(filename, text) {

    fs.writeFile(filename, text, function (err) {
        if (err) return console.log(err);
        console.log('CREATED => ', filename)
    });

}

function mkdir(dir) {
    if (!fs.existsSync(dir)) {
        console.log('CREATED => ', dir)
        fs.mkdirSync(dir);
        return true;
    }

    return false;
}

