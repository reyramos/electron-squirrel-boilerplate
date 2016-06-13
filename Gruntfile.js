var fs = require('fs'),
    path = require('path'),
    utilities = require('./app/libs/utilities.js');


'use strict';
module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(
        grunt, {
            config: 'package.json',
            scope: [
                'devDependencies',
                'dependencies'
            ]
        }
    );
    var config = require("./electron.config.js");
    var appConfig = {
        app: config.source,
        dist: config.distribution
    };

    require('./scripts/build_asar.js')(grunt);
    require('./scripts/build_wxs.js')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), // Project settings
        yeoman: appConfig, // Watches files for changes and runs tasks based on the changed files
        electronConfig: config, // Watches files for changes and runs tasks based on the changed files
        clean: {
            build: [appConfig.dist],
            release: {
                files: [{
                    expand: true,
                    cwd: appConfig.dist,
                    extDot: 'last',
                    src: ['**.wixobj', '**.wixpdb']
                }]
            }
        },
        exec: {
            'candle': {
                cmd: function () {
                    var files = getFilesPath('wxs', 'wixobj'),
                        command = ['"' + path.join(__dirname, 'staging', 'candle.exe') + '"',
                            '-ext "C:\\Program Files (x86)\\WiX Toolset v3.9\\bin\\WixUtilExtension.dll"',
                            files[0] + ' -o ' + files[1]
                        ].join(" ");

                    return command;
                }
            },
            'light': {
                cmd: function () {
                    var files = getFilesPath('wixobj', 'msi'),
                        command = ['"' + path.join(__dirname, 'staging', 'light.exe') + '"',
                            '-ext "C:\\Program Files (x86)\\WiX Toolset v3.9\\bin\\WixUtilExtension.dll"',
                            files[0] + ' -o ' + files[1]
                        ].join(" ");

                    return command;
                }
            }
        }
    });


    function getFilesPath(input, output) {
        var config = require("./electron.config.js"),
            APP_VERSION = config.version,
            BUILD_DESTINATION = path.join(__dirname, config.distribution),
            READ_FILE = 'v' + APP_VERSION + '.' + input,
            FILE_DESTINATION = 'v' + APP_VERSION + '.' + output;

        if (fs.existsSync(BUILD_DESTINATION)) {
            READ_FILE = path.join(BUILD_DESTINATION, READ_FILE);
            FILE_DESTINATION = path.join(BUILD_DESTINATION, FILE_DESTINATION);
        }

        return [READ_FILE, FILE_DESTINATION]
    }


    grunt.registerTask(
        'candle', ['exec:candle']
    );

    grunt.registerTask(
        'light', [
            'exec:light',
            'clean:release'
        ]
    );

    grunt.registerTask(
        'build', [
            'clean:build', //clean directory
            'electron-build', //build the electron package
            'msi-build', //build wxs file for candle light build
            'candle', //wix command
            'light' //wix command
        ]
    );
    grunt.registerTask(
        'default', ['build']
    );
};