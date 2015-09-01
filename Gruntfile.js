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
            buildtag: '-dev-' + grunt.template.today('yyyy-mm-dd'),
            watch: {
                options: {
                    livereload: true,
                    spawn: false
                },
                less: {
                    files: [
                        "{.tmp,app}/css/**/*.less",
                        "{.tmp,app}/**/*.less"
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
                    files: ['app/*.html']
                }
            },
            less: {
                dist: {
                    options: {
                        compress: true
                    },
                    files: {
                        ".tmp/styles.css": "app/css/styles.less"
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
                        'app/**/*.js'
                        , '!app/main.js' //dont add this to the compile scripts
                    ],
                    dest: ".tmp/scripts.js"
                }
            },
            template: {
                dev: {
                    files: {
                        ".tmp/index.html": "app/index.html"
                    },
                    environment: "dev"
                },
                dist: {
                    files: {
                        "dist/index.html": "app/index.html"
                    },
                    environment: "dist",
                    css_sources: '<%= grunt.file.read(".tmp/styles.css") %>',
                    js_sources: '<%= grunt.file.read(".tmp/scripts.min.js") %>'
                }
            },
            copy: {
                app: {
                    files: [{
                        expand: true,
                        dot: true,
                        cwd: 'app',
                        dest: 'dist',
                        src: [
                            'main.js'
                            ,'package.json'
                            , 'fonts/**/*.*'
                        ]
                    }]
                }
            },
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
                                connect.static('app')
                            ];
                        }
                    }
                },
                dist: {
                    options: {
                        base: 'dist',
                        middleware: function (connect, options) {
                            return [
                                connect().use(
                                    '/app', connect.static('app')
                                ),
                                connect.static('dist')
                            ];
                        }
                    }
                }
            },
            uglify: {
                options: {
                    preserveComments: false,
                    mangle: true,
                    compress: {
                        drop_console: true
                    },
                },
                dist: {
                    options: {
                        mangle: false,
                        compress: {
                            drop_console: true
                        }
                    },
                    files: {
                        '.tmp/scripts.min.js': '.tmp/scripts.js'
                    }
                }
            },
            clean: ['dist', '.tmp']
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
    grunt.registerTask('build', [
            'clean'
            , 'concat'
            , 'uglify'
            , 'less'
            , 'template:dist'
            , 'copy'
        ]
    );
    grunt.registerTask(
        'dist', [
            'connect:dist:keepalive'
        ]
    );
};