module.exports = function(grunt)
{
    var pkg = grunt.file.readJSON('package.json');

    var pngquantPlugin = require('imagemin-pngquant');

    grunt.initConfig
    ({
        pkg: pkg,
        jshint: {
            options: pkg.jshintConfig,
            all: [
                'Gruntfile.js',
                'app/scripts/**/*.js',
                'test/**/*.js'
            ]
        },
        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: 'dist/app'
            }
        },
        clean: {
            build: [
                'dist/app/**/*', '!dist/app/images/**'
            ],
            release: [".tmp/"]
        },
        copy: {
            release: {
                files: [
                    {
                        expand: true,
                        cwd: 'app',
                        src: [
                            //'images/*.{png,gif,jpg,svg}',
                            '*.html',
                            'js/lib/TweenMax.min.js',
                            'js/lib/jquery.min.js'
                        ],
                        dest: 'dist/app'
                    }
                ]
            }
        },
        filerev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 20
            },
            release: {
                // filerev:release hashes(md5) all assets (images, js and css )
                // in dist directory
                files: [{
                    src: [
                        //'dist/app/images/*.{png,gif,jpg,svg}',
                        'dist/app/js/*.js',
                        'dist/app/styles/*.css'
                    ]
                }]
            }
        },
        usemin: {
            html: ['dist/app/*.html'],
            css: ['dist/app/styles/*.css'],
            options: {
                assetsDirs: ['dist/app', 'dist/app/styles']
            }
        },
        less: {
            dev: {
                src: 'app/styles/main.less',
                dest: 'app/styles/main.css'
            },
            release: {
                src: 'app/styles/main.less',
                dest: 'dist/app/styles/main.css',
                options: {
                    compress: true
                }

            }
        },
        watch: {
            less: {
                files: ['app/styles/*.less'],
                tasks: ['less:dev']
            }
        },
        imagemin: {
            options:{
                use: [pngquantPlugin()]
            },
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'app/images/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'dist/app/images/'
                }]
            }
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


    grunt.registerTask('images', ['newer:imagemin']);

    grunt.registerTask("default",
    [
        'clean:build',
        'jshint',
        'less:release',
        'useminPrepare',
        'concat',
        'uglify',
        'copy',
        'images',
        'filerev',
        'usemin',
        'clean:release'
    ]);
};
