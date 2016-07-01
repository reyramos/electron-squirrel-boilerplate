let path = require('path'),
    fs = require('fs'),
    config = require("../electron.config.js"),
    rceditOpts = require('./rcedit.config.js'),
    shell = require('shelljs');


var package = require('../' + config.source + '/package.json');
var utilities = require('../' + config.source + '/libs/utilities.js');


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
config.execName = typeof config.execName === 'undefined' ? 'electron.exe' : config.execName;


module.exports = function (grunt) {

    grunt.registerTask('electron-build', 'Create Electron Package', function (arg) {

        var self = this,
            done = this.async();

        config['build_date'] = new Date().toJSON();

        /*
         * Documentation for electron-packager
         * https://github.com/electron-userland/electron-packager/blob/master/usage.txt
         */
        let command = "\"./node_modules/.bin/electron-packager\" app/",
        //build the command script based on config files
            _c = [
                command
                , "--platform=" + config.platform
                , "--arch=" + config.arch
                // , "--asar"
                , "--out=" + config.distribution
                , "--overwrite"
            ];

        /*
         * * win32 target platform only *
         * version-string     a list of sub-properties used to set the application metadata embedded into
         * the executable. They are specified via dot notation,
         */

        let versionString = rceditOpts['version-string'],
            appName = (package['productName'] || package['name']);

        Object.keys(versionString).forEach(function (key) {
            _c.push("--version-string." + key + "=\"" + versionString[key] + "\"")
        });


        //ICON PATH
        _c.push("--icon=\"" + rceditOpts['icon'] + "\"")
        //ELECTRON VERSION <https://github.com/electron/electron/releases>
        if (config.electronVersion)
            _c.push("--version=\"" + config.electronVersion + "\"")


        /*
         * * All platforms *
         */
        _c.push("--app-copyright=\"" + rceditOpts['version-string']['LegalCopyright'] + "\"");
        _c.push("--app-version=\"" + rceditOpts['version-string']['FileVersion'] + "\'");
        _c.push("--build-version=\"" + rceditOpts['version-string']['ProductVersion'] + "\"");


        const APP_VERSION = String(config.version).trim() || false;
        const APPLICATION_SRC = path.join(path.dirname(__dirname), config.source);

        const RELEASE = utilities.parse_url(config["VERSION_SERVER"]).scheme + '://' + utilities.parse_url(config["VERSION_SERVER"]).host + path.join(config.versionFilePath.replace(/\[WORKING_ENVIRONMENT\]/g, config['WORKING_ENVIRONMENT'].toLowerCase())).replace(/\\/g, '/');

        /*******************************************************************
         APPLICATION VARIABLES
         *******************************************************************/


        // utilities.file_put_content(path.join(APPLICATION_SRC, 'version.json'), JSON.stringify(config), function () {
        grunt.file.write(path.join(APPLICATION_SRC, 'config.json'), JSON.stringify(config), {encoding: 'utf8'});

        shell.exec((_c.join(" ")), function (code, stdout, stderr) {
            fs.unlinkSync(path.join(APPLICATION_SRC, 'config.json'));
            let appPath = path.join(path.dirname(__dirname), config.distribution, [appName, config.platform, config.arch].join("-"));


            if (fs.existsSync(appPath)) {
                //productName cannot have a space which will break the msi build
                fs.renameSync(path.join(appPath, appName + '.exe'), path.join(appPath, "_" + (config.execName).trim()))



                done(true);
            } else {
                grunt.log.writeln("electron path does not exist");
                done(false);
            }
        });

        // });

    });

};
