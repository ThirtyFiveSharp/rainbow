module.exports = function(grunt) {
    grunt.initConfig({
        mochaTest: {
            test: {
                options: {
                    require: 'test/init.js',
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'spec'
                },
                src: ['test/**/*.spec.js']
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'server.js', 'app/**/*.js', 'test/**/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['jshint', 'mochaTest']);
};