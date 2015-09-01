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

    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'dist'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), // Project settings
        yeoman: appConfig, // Watches files for changes and runs tasks based on the changed files
        watch: {
            options: {
                livereload: true,
                spawn: false
            },
            less: {
                files: [
                    "{.tmp,<%= yeoman.app %>}/css/**/*.less",
                    "{.tmp,<%= yeoman.app %>}/**/*.less"
                ],
                options: {
                    livereload: true,
                    spawn: false
                }
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                tasks: ['template:dev'],
                files: [
                    '<%= yeoman.app %>/*.template',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        }, //Compile less files to css
        less: {
            options: {
                compress: true,
                sourceMap: true,
                paths: ['<%= yeoman.dist %>/css'],
                sourceMapBasepath: "<%= yeoman.dist %>",
                outputSourceFiles: true,
                plugins: [
                    new (require('less-plugin-autoprefix'))({
                        browsers: ["last 2 versions"]
                    }),
                    new (require('less-plugin-clean-css'))({
                        advanced: true,
                    })
                ]
            },
            styles: {
                options: {
                    sourceMapFilename: "<%= yeoman.dist %>/styles.css.map",
                },
                files: {
                    "<%= yeoman.dist %>/styles.css": "<%= yeoman.app %>/css/styles.less" //move the compress css to dist
                }
            },
            desktop: {
                options: {
                    sourceMapFilename: "<%= yeoman.dist %>/desktop.css.map",
                },
                files: {
                    "<%= yeoman.dist %>/desktop_styles.css": "<%= yeoman.app %>/css/desktop.less" //move the compress css to dist
                }
            },
            mobile: {
                options: {
                    sourceMapFilename: "<%= yeoman.dist %>/mobile.css.map",
                },
                files: {
                    "<%= yeoman.dist %>/mobile_styles.css": "<%= yeoman.app %>/css/mobile.less" //move the compress css to dist
                }
            }
        },
        concat: {
            scripts: {
                src: [
                    '.tmp/scripts-require.js',
                    '.tmp/views.js',
                    '<%= yeoman.app %>/js/bootstrap.js' //concat the bootstrap at the every end
                ],
                dest: ".tmp/scripts-concat.js"
            }
        },
        requirejs: {
            dist: {
                options: {
                    baseUrl: "<%= yeoman.app %>/js",
                    findNestedDependencies: false,
                    removeCombined: true,
                    logLevel: 0,
                    mainConfigFile: "<%= yeoman.app %>/js/main.js",
                    name: 'main',
                    // include: [],
                    onBuildWrite: function (moduleName, path, contents) {
                        var modulesToExclude, shouldExcludeModule;
                        modulesToExclude = [
                            'main',
                            'bootstrap', //this must be loaded last
                            'development' //don't need in production
                        ];

                        shouldExcludeModule = modulesToExclude.indexOf(moduleName) >= 0;
                        return shouldExcludeModule ? '' : contents;
                    },
                    optimize: "none",
                    out: ".tmp/scripts-require.js",
                    preserveLicenseComments: false,
                    skipModuleInsertion: true,
                    generateSourceMaps: true
                }
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                mangle: true,
                compress: {
                    sequences: true,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                    drop_console: false
                },
            },
            scripts: {
                options: {
                    sourceMap: true,
                    sourceMapName: "<%= yeoman.dist %>/scripts.js.map",
                    sourceMapRoot: "<%= yeoman.dist %>/",
                    sourceMapIncludeSources: true,
                    sourceMapIn: '.tmp/scripts-require.js.map',
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
                },
                files: {
                    '<%= yeoman.dist %>/scripts.js': '.tmp/scripts-concat.js' //place the minify version in the dist folder
                }
            }
        },
        template: {
            dev: {
                files: {
                    ".tmp/index.html": "<%= yeoman.app %>/index.template"
                },
                environment: "dev"
            },
            dist: {
                files: {
                    ".tmp/index-concat.html": "<%= yeoman.app %>/index.template"
                },
                environment: "dist",
                css_sources: '<%= grunt.file.read(yeoman.dist+"/styles.css") %>',
                js_sources: '<%= grunt.file.read(yeoman.dist+"/scripts.js") %>'
            }
        }, //minify Angular Js, html files with $templateCache
        ngtemplates: {
            options: {
                //prefix: '/',
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }
            },
            dist: {
                cwd: '<%= yeoman.app %>',
                src: [
                    "js/**/**/*.html",
                    "views/**/**/*.html"
                ],
                dest: '.tmp/views.js'
            },

        },
        connect: {
            options: {
                port: 9000,
                hostname: "*",
                livereload: 35729,
                // open: true,
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use(
                                '/lib', connect.static('./lib')
                            ),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    base: '<%= yeoman.dist %>',
                    middleware: function (connect, options) {
                        return [
                            connect().use(
                                '/app', connect.static(appConfig.app)
                            ),
                            connect.static(appConfig.dist)
                        ];
                    }
                }
            }
        }, // Make sure code styles are up to par and there are no obvious mistakes
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            prod: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>'
                    ]
                }]
            },
        },
        ngAnnotate: {
            build: {
                files: {
                    '.tmp/scripts-concat.js': ['.tmp/scripts-concat.js']
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true, // Only if you don't use comment directives!
                    collapseWhitespace: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true
                },
                files: {
                    "<%= yeoman.dist %>/index.html": ".tmp/index-concat.html"
                }
            }
        }, // Copies remaining files to places other tasks can use, do not override the index.html file
        copy: {
            app: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'fonts/*.{png,jpg,jpeg,gif,webp,svg,eot,ttf,woff,woff2,otf}',
                        'main.js',
                        'package.json'
                    ]
                }]
            }
        }
    });

    grunt.registerTask(
        'serve', [
            'template:dev',
            'connect:livereload',
            'watch'
        ]
    );
    grunt.registerTask(
        'dist', [
            'connect:dist:keepalive'
        ]
    );
    grunt.registerTask(
        'build', [
            'clean' //clean directory
            , 'ngtemplates' //minify Angular Js, html files in templateCache
            , 'requirejs' //get all dependencies and combine in one file
            , 'concat:scripts' //concat all js files
            , 'ngAnnotate'
            , 'uglify' //uglify all js files
            , 'less' //compile less files in .tmp
            , 'template:dist' //concat all the compile files into index.html
            , 'htmlmin' //clean html
            , 'copy:app'
        ]
    );
    grunt.registerTask(
        'default', ['build', 'serve']
    );
};