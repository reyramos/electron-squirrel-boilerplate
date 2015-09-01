var APP_NAME = "LabCorp Phoenix",
    APP_DESCRIPTION = 'My application description',
    MANUFACTURER = 'LabCorp',
    APP_VERSION = '1.0';

var APPLICATION_ICON_SOURCE = "";


//path of your source files
var APPLICATION_SRC = './dist';
//path to electron files
var ELECTRON_PATH = './electron';
var BUILD_DESTINATION = ELECTRON_PATH + '/resources/app.asar';


/*******************************************************************
 APPLICATION VARIABLES
 *******************************************************************/

var uuid = require('node-uuid'), //generate unique UUID <https://github.com/broofa/node-uuid>
    asar = require('asar'), //create electron build from the application source files
    fs = require('fs'),
    path = require('path'),
    child = require('child_process');


asar.createPackage(APPLICATION_SRC, BUILD_DESTINATION, function () {
    console.log('Electron Package Created');
    console.log('Writting to package file, for wixtoolset');
    var ROOT_DIRECTORY_REFERENCE = "",
        COMPONENTS_REFS = "",
        DIRECTORY_REF = "",
        DIRECTORY = "",
        FILE_WXS = "",
        PRODUCT_GUID = uuid.v1(),
        UPGRADE_GUID = uuid.v1();

    var APP_CAB = APP_NAME.split(" ");
    APP_CAB.forEach(function (ele, index, array) {
        array[index] = ele.capitalize();
    });

    var APPLICATION_ICON_ID = APP_NAME.split(" ");
    APPLICATION_ICON_ID.forEach(function (ele, index, array) {
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


        walk(ELECTRON_PATH, function (obj) {
            //console.log('walk ===>', obj)
            var id = (obj.filePath.replace(/\\/g, " ")).split(/[\s{0,}\\\-_\.]/g),
                components = getComponents(obj.files, obj.filePath);
            id.forEach(function (ele, index, array) {
                array[index] = ele.capitalize();
            });
            id = id.join("");


            if (obj.dirname !== obj.root) {
                DIRECTORY += '<Directory Id="' + id + '" Name="' + obj.dirname + '" />';
                DIRECTORY_REF += '<DirectoryRef Id="' + id + '">' + components[0] + '</DirectoryRef>';
            } else {
                ROOT_DIRECTORY_REFERENCE = '<DirectoryRef Id="APPLICATIONROOTDIRECTORY">' + components[0] + '</DirectoryRef>';
            }

            COMPONENTS_REFS += components[1];

            if (components[2]) {
                //if this exist then lets add it
                DIRECTORY_REF += components[2];

            }

        });


        DIRECTORY_REF = ROOT_DIRECTORY_REFERENCE + DIRECTORY_REF;

        FILE_WXS = FILE_WXS.replace(/{{DIRECTORY}}/g, DIRECTORY);
        FILE_WXS = FILE_WXS.replace(/{{DIRECTORY_REF}}/g, DIRECTORY_REF);
        FILE_WXS = FILE_WXS.replace(/{{COMPONENTS_REFS}}/g, COMPONENTS_REFS);
        FILE_WXS = FILE_WXS.replace(/{{APPLICATION_ICON_ID}}/g, (APPLICATION_ICON_ID).join("") + ".icon");
        FILE_WXS = FILE_WXS.replace(/{{APPLICATION_ICON_SOURCE}}/g, APPLICATION_ICON_SOURCE);


        fs.writeFile((APP_NAME.split(" ")).join("_") + '.wxs', FILE_WXS, function (err) {
            if (err) return console.log(err);
            console.log('CREATED => ', (APP_NAME.split(" ")).join("_") + '.wxs')
        });

    });


});


function getComponents(files, filePath) {

    var COMPONENTS = "",
        DIRECTORY_REF = "",
        COMPONENTS_REFS = "",
        appName = APP_NAME.split(" ");


    appName.forEach(function (ele, index, array) {
        array[index] = ele.capitalize();
    });

    appName = appName.join("");

    for (var i in files) {
        var file = files[i],
            ext = file.substr((~-file.lastIndexOf(".") >>> 0) + 2),
            id = (file.replace('.' + ext, " ")).split(/[\s{0,}\\\-_\.]/g);

        id.forEach(function (ele, index, array) {
            array[index] = ele.capitalize();
        });
        id = id.join("");


        var idComponent = id + "COMP";
        var idFile = id + "FILE";


        switch (ext) {
            case 'exe':
                idComponent = file;

                COMPONENTS += ['<Component',
                    'Id=\'' + file + '\'',
                    'Guid=\'' + uuid.v1() + '\'>',
                    '<File Id=\'' + file + '\'',
                    'Source=\'' + filePath + file + '\'',
                    'KeyPath="yes" Checksum="yes"',
                    'Vital=\'yes\'/>',
                    '<RemoveFolder Id="APPLICATIONROOTDIRECTORY"',
                    'On="uninstall"/>',
                    '</Component>'].join(" ");


                /**************************************************************
                 * CREATE THE APPLICATION SHORTCUT ON START MENU
                 **************************************************************/

                DIRECTORY_REF += ['<DirectoryRef Id="ApplicationProgramsFolder">',
                    '<Component Id="ApplicationShortcut" Guid="' + uuid.v1() + '">',
                    '<Shortcut Id="ApplicationStartMenuShortcut"',
                    'Name="' + APP_NAME + '"',
                    'Description="' + APP_DESCRIPTION + '"',
                    'Target="[#' + file + ']"',
                    'WorkingDirectory="APPLICATIONROOTDIRECTORY"/>' +
                    '<RemoveFolder Id="ApplicationProgramsFolder" On="uninstall"/>',
                    '<RegistryValue Root="HKCU" Key="Software\\Microsoft\\' + appName + '"',
                    'Name="installed"',
                    'Type="integer" Value="1"',
                    'KeyPath="yes"/></Component>',
                    '</DirectoryRef>'].join(" ");

                COMPONENTS_REFS += '<ComponentRef Id="ApplicationShortcut" />';


                break;
            default :
                COMPONENTS += ['<Component',
                    'Id=\'' + idComponent + '\'',
                    'Guid=\'' + uuid.v1() + '\'>',
                    '<File ' +
                    'Id=\'' + idFile + '\'',
                    //'Name=\'' + file + '\'',
                    'Source=\'' + filePath + file + '\'',
                    'KeyPath="yes" Vital=\'yes\' />',
                    '</Component>'].join(" ");
                break;
        }

        COMPONENTS_REFS += '<ComponentRef Id="' + idComponent + '" />';


    }

    return [COMPONENTS, COMPONENTS_REFS, DIRECTORY_REF];

}


function mkdir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        return true;
    }

    return false;
}


function rmdir(directories, callback) {
    if (typeof directories === 'string') {
        directories = [directories];
    }
    var args = directories;
    args.unshift('-rf');
    child.execFile('rm', args, {env: process.env}, callback);
};

function grep(elems, callback, invert) {
    var callbackInverse,
        matches = [],
        i = 0,
        length = elems.length,
        callbackExpect = !invert;

    // Go through the array, only saving the items
    // that pass the validator function
    for (; i < length; i++) {
        callbackInverse = !callback(elems[i], i);
        if (callbackInverse !== callbackExpect) {
            matches.push(elems[i]);
        }
    }

    return matches;
}

/**
 * Simple function to walk into a directory and return the file path
 * @param currentDirPath
 * @param callback
 */
function walk(currentDirPath, callback) {
    var handler = [],
        referenceTable = [];
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name),
            filename = filePath.substr((~-filePath.lastIndexOf("\\") >>> 0) + 2),
            root = filePath.substr(0, (~-filePath.indexOf("\\") >>> 0) + 1),
            dirname = currentDirPath.substr((~-currentDirPath.lastIndexOf("\\") >>> 0) + 2) || currentDirPath.substr((~-currentDirPath.lastIndexOf("/") >>> 0) + 2);

        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            this.push({
                filename: filename,
                dirname: dirname,
                root: root,
                filePath: filePath.replace(filename, ""),
                files: [filename]
            })
            //callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walk(filePath, callback);
        }
    }, handler);

    for (var i in handler) {
        if (handler.hasOwnProperty(i)) {
            var dirname = handler[i].dirname,
                refTable = grep(referenceTable, function (val) {
                    return val['dirname'] === dirname;
                })[0],
                obj = handler[i];
            if (refTable) {
                refTable.files.push(obj.filename);
            } else {
                referenceTable.push(obj);
            }
        }
    }

    callback(referenceTable[0]);

}

String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
    });
};
