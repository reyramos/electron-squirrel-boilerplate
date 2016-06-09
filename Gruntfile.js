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
        app: 'app',
        dist: 'build',
    };

    // Define the configuration for all the tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), // Project settings
        yeoman: appConfig, // Watches files for changes and runs tasks based on the changed files
        electronConfig: config, // Watches files for changes and runs tasks based on the changed files
        clean: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'build',
                    extDot: 'last',
                    src: ['**.wixobj', '**.wixpdb']
                }]
            },
            asar: {
                files: [{
                    expand: true,
                    cwd: '<%= electronConfig.electron_build %>',
                    src: ['resources/app.asar']
                }]
            }
        },
        exec: {
            'candle': {
                cmd: function () {
                    var files = getFilesPath('wxs', 'wixobj'),
                        command = ['candle.exe',
                            '-ext "C:\\Program Files (x86)\\WiX Toolset v3.9\\bin\\WixUtilExtension.dll"',
                            files[0] + ' -o ' + files[1]
                        ].join(" ");


                    return command;
                }
            },
            'light': {
                cmd: function () {
                    var files = getFilesPath('wixobj', 'msi'),
                        command = ['light.exe',
                            '-ext "C:\\Program Files (x86)\\WiX Toolset v3.9\\bin\\WixUtilExtension.dll"',
                            files[0] + ' -o ' + files[1]
                        ].join(" ");

                    return command;

                }
            }
        }
    });


    grunt.registerTask('electron-build', 'Create Electron Package', function (arg) {
        var build = require('./scripts/build_asar.js');
        build.apply(this, [grunt, arg])
    });
    grunt.registerTask('msi-build', 'Create MSI definition for wix', function (dirName) {
        var config = require("./electron.config.js"),
            done = this.async();
        // test that the new electron app is created
        if (fs.existsSync(path.join(__dirname, config.distribution, dirName))) {
            var build = require('./scripts/build_wxs.js');
            build.apply(this, [grunt, dirName])
        } else {
            grunt.log.writeln("distribution path does not exist");
        }

        done(false);

    });


    // function validate() {
    //     var config = require("./electron.config.js");
    //     var APP_VERSION = String(config.version).trim() || false;
    //     var BUILD_DESTINATION = path.join(__dirname, config.distribution);
    //     var BUILD_FILE = false;
    //     try {
    //         BUILD_FILE = fs.existsSync(BUILD_DESTINATION) ? require(path.join(BUILD_DESTINATION, 'build.json')) : require('build.json');
    //     } catch (e) {
    //     }
    //
    //     var BUILD_VERSION = String(BUILD_FILE.version).trim() || false;
    //
    //     return BUILD_VERSION !== APP_VERSION;
    // }

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


    // grunt.registerTask(
    //     'candle', ['exec:candle']
    // );
    //
    // grunt.registerTask(
    //     'light', [
    //         'exec:light',
    //         'clean'
    //     ]
    // );

    grunt.registerTask(
        'build', [
            'electron-build'
        ]
    );
    grunt.registerTask(
        'default', ['build']
    );
};