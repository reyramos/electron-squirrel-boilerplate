//path of your source files
var APPLICATION_SRC = './app';
//path to electron files
var ELECTRON_PATH = './electron';
var BUILD_DESTINATION = ELECTRON_PATH + '/resources/app.asar';

/*******************************************************************
 APPLICATION VARIABLES
 *******************************************************************/

var uuid = require('node-uuid'), //generate unique UUID <https://github.com/broofa/node-uuid>
    asar = require('asar'), //create electron build from the application source files
    fs = require('fs'),
    path = require('path');


asar.createPackage(APPLICATION_SRC, BUILD_DESTINATION, function () {
    console.log('Electron Package Created');
    console.log('Writting to package file, for wixtoolset');

    walk(APPLICATION_PATH, function (filePath, stat) {
        console.log(filePath, ':', uuid.v1())

    });

});


/**
 * Simple function to walk into a directory and return the file path
 * @param currentDirPath
 * @param callback
 */
function walk(currentDirPath, callback) {

    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walk(filePath, callback);
        }
    });
}


