var APP_NAME = "LabCorp Phoenix",
    MANUFACTURER = 'LabCorp',
    APP_VERSION = '1.0';

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
    var COMPONENTS = "",
        COMPONENTS_REFS = "",
        FILE_WXS = "",
        PRODUCT_GUID = uuid.v1(),
        UPGRADE_GUID = uuid.v1(),
        rootFiles = [];

    var APP_CAB = APP_NAME.split(" ");
    APP_CAB.forEach(function (ele, index, array) {
        array[index] = ele.capitalize();
    });


    fs.readFile('template.wxs', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        FILE_WXS = data;

        //replace the APP_CAB
        FILE_WXS = FILE_WXS.replace(/{{APP_CAB}}/g, (APP_CAB).join("") + ".cab");
        //replace the MANUFACTURER
        FILE_WXS = FILE_WXS.replace(/{{MANUFACTURER}}/g, MANUFACTURER);
        //replace the APP_NAME
        FILE_WXS = FILE_WXS.replace(/{{APP_NAME}}/g, APP_NAME);
        //replace the PRODUCT_GUID
        FILE_WXS = FILE_WXS.replace(/{{PRODUCT_GUID}}/g, PRODUCT_GUID);
        //replace the UPGRADE_GUID
        FILE_WXS = FILE_WXS.replace(/{{UPGRADE_GUID}}/g, UPGRADE_GUID);
        //replace the APP_VERSION
        FILE_WXS = FILE_WXS.replace(/{{APP_VERSION}}/g, APP_VERSION);

        walk(ELECTRON_PATH, function (filePath, stat) {

            var filename = filePath.substr((~-filePath.lastIndexOf("\\") >>> 0) + 2),
                ext = filename.substr((~-filename.lastIndexOf(".") >>> 0) + 2),
                id = (filePath.replace('.' + ext, "")).split(/[\s{0,}\\\-_\.]/g),
                destination = filePath.substr((~-filePath.indexOf('\\') >>> 0) + 2),
                dirLayers = destination.split("\\");

            id.forEach(function (ele, index, array) {
                array[index] = ele.capitalize();
            });

            id = id.join("");

            if (dirLayers.length > 1) {
                console.log('dirLayers', dirLayers)
            } else {
                rootFiles.push({
                    Name: dirLayers[0],
                    Id: id,
                    Guid: uuid.v1(),
                    Source: filePath
                })
            }

        });


        //console.log('rootFiles', rootFiles)
        //
        //
        ////replace the APP_VERSION
        //FILE_WXS = FILE_WXS.replace(/{{COMPONENTS}}/g, COMPONENTS);
        //FILE_WXS = FILE_WXS.replace(/{{COMPONENTS_REFS}}/g, COMPONENTS_REFS);

        fs.writeFile((APP_NAME.split(" ")).join("_") + '.wxs', FILE_WXS, function (err) {
            if (err) return console.log(err);

            console.log('CREATED => ', (APP_NAME.split(" ")).join("_") + '.wxs')
        });

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

String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
    });
};
