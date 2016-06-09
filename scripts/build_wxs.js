let path = require('path'),
    fs = require('fs'),
    utilities = require('../app/libs/utilities.js'),
    config = require("../electron.config.js"),
    rceditOpts = require('./rcedit.config.js'),
    shell = require('shelljs'),
    uuid = require('node-uuid'), //generate unique UUID <https://github.com/broofa/node-uuid>
    child = require('child_process');

String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
    });
};

/*******************************************************************
 APPLICATION VARIABLES
 *******************************************************************/

module.exports = function (grunt, arg) {


    var done = this.async();
    config['build_date'] = new Date().toJSON();

    grunt.log.writeln("config", config);

    const APP_NAME = config.app_name;
    const APP_DESCRIPTION = config.app_description;
    const MANUFACTURER = config.manufacturer;
    const APP_VERSION = String(config.version).trim() || false;
    const APPLICATION_SRC = path.join(path.dirname(__dirname), config.source);
    const BUILD_DESTINATION = path.join(path.dirname(__dirname), config.distribution);


//searches for icon.png file in the application src to set the Add/Remove icon
    var APPLICATION_ICON_SOURCE = path.join(APPLICATION_SRC, 'icon.ico');

//path to electron files
    const ELECTRON_PATH = path.join(BUILD_DESTINATION, arg);
    const ELECTRON_BUILD_DESTINATION = path.join(ELECTRON_PATH, '/resources/app.asar');


    var ELECTRON_EXE_DESTINATION = path.join(ELECTRON_PATH, rceditOpts['version-string'].ProductName + '.exe');
    var buildFileName = config.versionFilePath.split('/');

    buildFileName = buildFileName[buildFileName.length - 1];


    grunt.log.writeln("APP_NAME", APP_NAME);
    grunt.log.writeln("APP_DESCRIPTION", APP_DESCRIPTION);
    grunt.log.writeln("MANUFACTURER", MANUFACTURER);
    grunt.log.writeln("APP_VERSION", APP_VERSION);
    grunt.log.writeln("APPLICATION_SRC", APPLICATION_SRC);
    grunt.log.writeln("BUILD_DESTINATION", BUILD_DESTINATION);
    grunt.log.writeln("APPLICATION_ICON_SOURCE", APPLICATION_ICON_SOURCE);
    grunt.log.writeln("ELECTRON_PATH", ELECTRON_PATH);
    grunt.log.writeln("ELECTRON_BUILD_DESTINATION", ELECTRON_BUILD_DESTINATION);
    grunt.log.writeln("ELECTRON_EXE_DESTINATION", ELECTRON_EXE_DESTINATION);
    grunt.log.writeln("buildFileName", buildFileName);


    done();

};




