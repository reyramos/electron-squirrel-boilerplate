module.exports = function (grunt) {
    require('load-grunt-tasks')(
        grunt, {
            config: 'package.json',
            scope: ['devDependencies', 'dependencies']
        }
    );
    grunt.initConfig(
        {
            pkg: grunt.file.readJSON('package.json'),
            yeoman: {
                app: 'app',
                dist: 'dist'
            },
            appConfig:this.yeoman,
            buildtag: '-dev-' + grunt.template.today('yyyy-mm-dd'),
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
                    files: ['<%= yeoman.app %>/*.html']
                }
            },
            less: {
                dist: {
                    options: {
                        compress: true
                    },
                    files: {
                        ".tmp/styles.css": "css/styles.less"
                    }
                }
            },
            concat: {
                options: {
                    stripBanners: true,
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    sourceMap: true
                },
                dist: {
                    src: [
                        '<%= yeoman.app %>/**/*.js'
                        ,'!<%= yeoman.app %>/main.js' //dont add this to the compile scripts
                    ],
                    dest: ".tmp/scripts.js"
                }
            },
            template: {
                dev: {
                    files: {
                        ".tmp/index.html": "<%= yeoman.app %>/index.html"
                    },
                    environment: "dev"
                },
                dist: {
                    files: {
                        "<%= yeoman.dist %>/index.html": "<%= yeoman.app %>/index.html"
                    },
                    environment: "dist",
                    css_sources: '<%= grunt.file.read(".tmp/styles.css") %>',
                    js_sources: '<%= grunt.file.read(".tmp/scripts.min.js") %>'
                }
            }, // The actual grunt server settingscop
            connect: {
                options: {
                    port: 9000,
                    hostname: "*",
                    livereload: 35729,
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
            },
            uglify: {
                options: {
                    preserveComments: false,
                    mangle: false,
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
                dist: {
                    options: {
                        mangle: true,
                        compress: {
                            drop_console: true
                        }
                    },
                    files: {
                        '.tmp/scripts.min.js': '.tmp/scripts.js'
                    }
                }
            },
            clean: ['<%= yeoman.dist %>']
        }
    );
    grunt.registerTask('default', ['build']);
    grunt.registerTask(
        'serve', [
            'template:dev',
            'connect:livereload',
            'watch'
        ]
    );
    grunt.registerTask(
        'build', [
            , 'clean'
            , 'concat'
            , 'uglify'
            , 'less'
            , 'template:dist' //concat all the compile files into index.html
        ]
    );
    grunt.registerTask(
        'dist', [
            'connect:dist:keepalive'
        ]
    );
};