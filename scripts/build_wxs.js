let path = require('path'),
    fs = require('fs'),
    utilities = require('../app/libs/utilities.js'),
    config = require("../electron.config.js"),
    rceditOpts = require('./rcedit.config.js'),
    rcedit = require('rcedit'),
    shell = require('shelljs'),
    uuid = require('node-uuid'), //generate unique UUID <https://github.com/broofa/node-uuid>
    child = require('child_process');

String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
    });
};

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


/*******************************************************************
 APPLICATION VARIABLES
 *******************************************************************/
var package = require('../' + config.source + '/package.json');

module.exports = function (grunt) {

    grunt.registerTask('msi-build', 'Create MSI definition for wix', function (arg) {

        grunt.log.write('config:', config);


        var self = this,
            done = this.async(),
            appName = [(package['productName'] || package['name']), config.platform, config.arch].join("-");


        config['build_date'] = new Date().toJSON();

        const APP_NAME = config.app_name;
        const APP_DESCRIPTION = config.app_description;
        const MANUFACTURER = config.manufacturer;
        const APP_VERSION = String(config.version).trim() || false;
        const APPLICATION_SRC = path.join(path.dirname(__dirname), config.source);
        const BUILD_DESTINATION = path.join(path.dirname(__dirname), config.distribution);

        //searches for icon.png file in the application src to set the Add/Remove icon
        var APPLICATION_ICON_SOURCE = path.join(APPLICATION_SRC, 'icon.ico');

        //path to electron files
        const ELECTRON_PATH = path.join(BUILD_DESTINATION, appName);
        var ELECTRON_EXE_DESTINATION = path.join(ELECTRON_PATH, 'electron.exe');


        var buildFileName = config.versionFilePath.split('/');

        buildFileName = buildFileName[buildFileName.length - 1];

        const RELEASE = utilities.parse_url(config["VERSION_SERVER"]).scheme + '://' + utilities.parse_url(config["VERSION_SERVER"]).host + path.join(config.versionFilePath.replace(/\[WORKING_ENVIRONMENT\]/g, config['WORKING_ENVIRONMENT'].toLowerCase())).replace(/\\/g, '/');

        if (fs.existsSync(ELECTRON_PATH)) {
            rcedit(ELECTRON_EXE_DESTINATION, rceditOpts, function (error) {
                if (error) {
                    console.error(error)
                    done(false);
                }

                var FILE_WXS = grunt.file.read(path.join(__dirname, 'template.wxs'), {
                    // If an encoding is not specified, default to grunt.file.defaultEncoding.
                    // If specified as null, returns a non-decoded Buffer instead of a string.
                    encoding: 'utf8'
                });

                createPackage(FILE_WXS, done);
            });
        } else {
            grunt.log.writeln("missing path =>", ELECTRON_PATH);
            done(false);
        }

        function createPackage(FILE_WXS, callback) {
            //make the directory for the
            utilities.mkdir(BUILD_DESTINATION);

            grunt.log.writeln('Creating WXS Package!');

            var ROOT_DIRECTORY_REFERENCE = "",
                COMPONENTS_REFS = "",
                DIRECTORY_REF = "",
                DIRECTORY = "",

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
                if (obj.dirname !== 'default_app') {
                    var id = (obj.filePath.replace(/[^\w\*]/g, " ")).split(/[\s{0,}\\\-_\.]/g),
                        components = getComponents(obj.files, obj.filePath);

                    id.forEach(function (ele, index, array) {
                        array[index] = ele.capitalize();
                    });
                    id = id.join("");

                    if (obj.filePath !== path.join(ELECTRON_PATH, '/')) {
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
                }
            });

            DIRECTORY_REF = ROOT_DIRECTORY_REFERENCE + DIRECTORY_REF;
            FILE_WXS = FILE_WXS.replace(/{{DIRECTORY}}/g, DIRECTORY);
            FILE_WXS = FILE_WXS.replace(/{{DIRECTORY_REF}}/g, DIRECTORY_REF);
            FILE_WXS = FILE_WXS.replace(/{{COMPONENTS_REFS}}/g, COMPONENTS_REFS);

            //we are creating the installer icon in Add/Remove programs
            APPLICATION_ICON_SOURCE = fs.existsSync(APPLICATION_ICON_SOURCE) ? '<Icon Id="' + ((APPLICATION_ICON_ID).join("") + ".icon") + '" SourceFile="' + APPLICATION_ICON_SOURCE + '"/>\r\n<Property Id="ARPPRODUCTICON" Value="' + ((APPLICATION_ICON_ID).join("") + ".icon") + '" />' : "";

            FILE_WXS = FILE_WXS.replace(/{{APPLICATION_ICON_SOURCE}}/g, APPLICATION_ICON_SOURCE);

            var filePath = fs.existsSync(BUILD_DESTINATION) ? BUILD_DESTINATION : __dirname,
                gruntWrite = function (path, content) {
                    grunt.file.write(path, content, {
                        encoding: 'utf8'
                    });
                };

            gruntWrite(path.join(filePath, config.app_name + '_' + 'v' + APP_VERSION + '.wxs'), FILE_WXS);
            gruntWrite(path.join(filePath, buildFileName), JSON.stringify(config));

            grunt.log.writeln('=============================================================\r\n');
            grunt.log.writeln('Execute the following command to build the msi file\r\n');
            grunt.log.writeln('GRUNT => candle light\r\n')
            grunt.log.writeln('=============================================================\r\n');

            callback()

        }

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


                        idComponent = file.replace(/[\s{0,}\\\-_\.]/g, '_').toUpperCase();

                        COMPONENTS += ['<Component',
                            'Id=\'' + idComponent + '\'',
                            'Guid=\'' + uuid.v1() + '\'>',
                            '<File Id=\'' + file + '\'',
                            'Source=\'' + filePath + file + '\'',
                            'KeyPath="yes" Checksum="yes"',
                            //'Vital=\'yes\'' +
                            '/>',
                            '<RemoveFolder Id="APPLICATIONROOTDIRECTORY"',
                            'On="uninstall"/>'].join(" ");

                        /**************************************************************
                         * CREATE THE APPLICATION SHORTCUT ON START MENU
                         **************************************************************/

                        COMPONENTS += ['<Shortcut Id="ApplicationStartMenuShortcut" Name="' + APP_NAME + '"',
                            'Description="' + APP_DESCRIPTION + '"',
                            'Advertise="yes"',
                            'Directory="ApplicationProgramsFolder"',
                            'WorkingDirectory="APPLICATIONROOTDIRECTORY">',
                            '<Icon Id="' + file + '"',
                            'SourceFile="' + filePath + file + '" />',
                            '</Shortcut>',
                            '<RemoveFolder Id="ApplicationStartMenuShortcut"',
                            'Directory="ApplicationProgramsFolder"',
                            'On="uninstall" />'
                        ].join(" ");


                        /**************************************************************
                         * CREATE THE APPLICATION SHORTCUT ON DESKTOP
                         **************************************************************/

                        COMPONENTS += ['<Shortcut Id="ApplicationShortcutDesktop" Name="' + APP_NAME + '"',
                            'Description="' + APP_DESCRIPTION + '"',
                            'Advertise="yes"',
                            'Directory="DesktopFolder"',
                            'WorkingDirectory="APPLICATIONROOTDIRECTORY">',
                            '<Icon Id="DesktopIcon.ico"',
                            'SourceFile="' + APPLICATION_ICON_SOURCE + '" />',
                            '</Shortcut>',
                            '<RemoveFolder Id="ApplicationShortcutDesktop"',
                            'Directory="DesktopFolder"',
                            'On="uninstall" />'
                        ].join(" ");


                        //registry Information
                        //http://wixtoolset.org/documentation/manual/v3/xsd/wix/removeregistrykey.html
                        //http://wixtoolset.org/documentation/manual/v3/xsd/wix/simple_type_registryroottype.html
                        //http://mintywhite.com/vista/hkcr-hkcu-hklm-hku-hkcc-registry-root-keys/
                        COMPONENTS += ['<RegistryKey Root="HKLM"',
                            //'Id=""',
                            'Key="Software\\Microsoft\\' + appName + '"',
                            'ForceCreateOnInstall="yes">',
                            '<RegistryValue Type="integer" Name="SomeIntegerValue" Value="1"/>',
                            '<RegistryValue Type="string" Value="~ WIN7RTM"/>',

                            '</RegistryKey>'].join(" ");

                        COMPONENTS += '</Component>';


                        break;
                    default :
                        COMPONENTS += ['<Component',
                            'Id=\'' + idComponent + '\'',
                            'Guid=\'' + uuid.v1() + '\'>',
                            '<File ' +
                            'Id=\'' + idFile + '\'',
                            //'Name=\'' + file + '\'',
                            'Source=\'' + filePath + file + '\'',
                            'KeyPath="yes" ' +
                            //'Vital=\'yes\' ' +
                            '/>',
                            '<RemoveFile Id="Remove' + idComponent + '" Name="' + file + '" On="both"/>',
                            '</Component>'].join(" ");
                        break;
                }

                COMPONENTS_REFS += '<ComponentRef Id="' + idComponent + '" />';

            }

            return [COMPONENTS, COMPONENTS_REFS, DIRECTORY_REF];

        }

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
                    dirname = currentDirPath.substr((~-currentDirPath.lastIndexOf("\\") >>> 0) + 2) || currentDirPath.substr((~-currentDirPath.lastIndexOf("/") >>> 0) + 2);

                var stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    this.push({
                        filename: filename,
                        dirname: dirname,
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

    });
};





