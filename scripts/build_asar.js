let path = require('path'),
    fs = require('fs'),
    utilities = require('../app/libs/utilities.js'),
    config = require("../electron.config.js"),
    rceditOpts = require('./rcedit.config.js'),
    shell = require('shelljs');


module.exports = function (grunt, arg) {


    var done = this.async();
    config['build_date'] = new Date().toJSON();

    /*
     * Documentation for electron-packager
     * https://github.com/electron-userland/electron-packager/blob/master/usage.txt
     */
    let command = "\"./node_modules/.bin/electron-packager\" app/",
        //build the command script based on config files
        _c = [command, "--platform=" + config.platform, "--arch=" + config.arch, "--asar", "--out=" + config.distribution, "--overwrite"];

    /*
     * * win32 target platform only *
     * version-string     a list of sub-properties used to set the application metadata embedded into
     * the executable. They are specified via dot notation,
     */

    let versionString = rceditOpts['version-string'],
        appName = [versionString['ProductName'], config.platform, config.arch].join("-");

    Object.keys(versionString).forEach(function (key) {
        _c.push("--version-string." + key + "=\"" + versionString[key] + "\"")
    });


    /*
     * ICON PATH
     */
    _c.push("--icon=\"" + rceditOpts['icon'] + "\"")

    /*
     * * All platforms *
     */
    _c.push("--app-copyright=\"" + rceditOpts['version-string']['LegalCopyright'] + "\"");
    _c.push("--app-version=\"" + rceditOpts['version-string']['FileVersion'] + "\'");
    _c.push("--build-version=\"" + rceditOpts['version-string']['ProductVersion'] + "\"");


    const APP_VERSION = String(config.version).trim() || false;
    const APPLICATION_SRC = path.join(path.dirname(__dirname), config.source);
    const DEVELOPMENT_SRC = path.join(path.dirname(__dirname), config.development);

    const RELEASE = utilities.parse_url(config["VERSION_SERVER"]).scheme + '://' + utilities.parse_url(config["VERSION_SERVER"]).host + path.join(config.versionFilePath.replace(/\[WORKING_ENVIRONMENT\]/g, config['WORKING_ENVIRONMENT'].toLowerCase())).replace(/\\/g, '/');

    /*******************************************************************
     APPLICATION VARIABLES
     *******************************************************************/
    grunt.log.writeln("APP_VERSION =>",APP_VERSION);
    grunt.log.writeln("APPLICATION_SRC =>",DEVELOPMENT_SRC);
    grunt.log.writeln("DEVELOPMENT_SRC =>",DEVELOPMENT_SRC);




    /**
     * This functionality is to check if the build.json file exist, if it exist it will check if the version is already created.
     * So it will force the developer to upgrade their version for the new build
     */

    utilities.getVersion(RELEASE, function (status, obj) {

        // create the versioning file
        if (fs.existsSync(APPLICATION_SRC)) {
            utilities.file_put_content(path.join(APPLICATION_SRC, 'version.json'), JSON.stringify(config));
        }

        if (fs.existsSync(DEVELOPMENT_SRC)) {
            utilities.file_put_content(path.join(DEVELOPMENT_SRC, 'version.json'), JSON.stringify(config));
        }

        const BUILD_VERSION = String(obj.version).trim() || false;
        var vrsCompare = utilities.versionCompare(APP_VERSION, BUILD_VERSION);
        if (vrsCompare > 0) {


            var command = (_c.join(" "));
            shell.exec(command, function (code, stdout, stderr) {
                if (stdout) {
                    grunt.log.writeln('ERROR:', error);
                    done(false);
                } else if (stderr) {

                    if (fs.existsSync(path.join(DEVELOPMENT_SRC, 'version.json'))) {
                        grunt.log.writeln("FINISH");
                    }
                    // // test that the new electron app is created
                    // if (fs.existsSync(path.join(config.distribution, appName))) {
                    //     // grunt.log.writeln('stdout:', stdout);
                    //     grunt.task.run(['msi-build:' + appName]);
                    //     done(true);
                    // } else {
                    //     grunt.log.writeln("electron path does not exist");
                    //     done(false);
                    // }
                }
            });

        } else {
            grunt.log.writeln('\n\nUPDATE YOUR VERSION FILE, VERSION:' + APP_VERSION + ' ALREADY EXIST');
            done(false);
        }
    }, function (error) {
        grunt.log.writeln(error);
        done(false);

    });

};
