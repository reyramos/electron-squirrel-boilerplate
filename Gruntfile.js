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
                        command = ['candle.exe', '-ext WixUtilExtension.dll "', files[0] + '" -o "' + files[1] + '"'].join(" ");

                    return command;
                }
            },
            'light': {
                cmd: function () {
                    var files = getFilesPath('wixobj', 'msi'),
                        command = ['light.exe', '-ext WixUtilExtension.dll "', files[0] + '" -o "' + files[1] + '"'].join(" ");

                    return command;
                }
            }
        }
    });


    function getFilesPath(input, output) {
        var config = require("./electron.config.js"),
            APP_VERSION = config.version,
            BUILD_DESTINATION = path.join(__dirname, config.distribution),
            PREFIX = config.app_name + '_' + 'v' + APP_VERSION,
            READ_FILE = PREFIX + '.' + input,
            FILE_DESTINATION = PREFIX + '.' + output;

        if (fs.existsSync(BUILD_DESTINATION)) {
            READ_FILE = path.join(BUILD_DESTINATION, READ_FILE);
            FILE_DESTINATION = path.join(BUILD_DESTINATION, FILE_DESTINATION);
        }

        return [READ_FILE, FILE_DESTINATION]
    }


    grunt.registerTask("help", "Usage Text for Grunt.", function () {
        grunt.log.write('Usage\n');
        grunt.log.write('\tgrunt [task][:option]\n');
        grunt.log.write('\n');
        grunt.log.write('tasks\n');
        grunt.log.write('\t' + 'build' + '\t\t' + 'Builds the Electron package and msi installation \n');
        grunt.log.write('\t' + 'candle' + '\t\t' + 'Builds *.wixobj file\n');
        grunt.log.write('\t' + 'light' + '\t\t' + 'Builds *.msi script, removes *.wixobj file\n');
        grunt.log.write('\n');
        grunt.log.write('options\n');
        grunt.log.write('\t' + 'electron' + '\t' + 'Builds the Electron package\n');
        grunt.log.write('\t' + 'msi' + '\t\t' + 'Builds the Electron && *.wxs file\n');
    });

    grunt.registerTask(
        'candle', ['exec:candle']
    );

    grunt.registerTask(
        'light', [
            'exec:light',
            'clean:release'
        ]
    );

    grunt.registerTask('build', function (target) {
        var tasks = [
            'clean:build' //clean directory
        ];

        switch (target) {
            case "electron":
                return grunt.task.run(tasks.concat([
                    'electron-build'
                ]));
                break;
            case "msi":
                return grunt.task.run(tasks.concat([
                    'electron-build',
                    'msi-build'
                ]));
                break;
            default:
                return grunt.task.run(tasks.concat([
                    'electron-build', //build the electron package
                    'msi-build', //build wxs file for candle light build
                    'candle', //wix command
                    'light' //wix command
                ]));
                break;
        }
    });


    grunt.registerTask(
        'default', ['build']
    );
};