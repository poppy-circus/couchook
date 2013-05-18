module.exports = function(grunt) {

  "use strict";

  var exec = require('child_process').exec;

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: ['grunt.js', 'src/**/!(lodash|)*.js', 'test/**/*.js'],
      options: {
        browser: true,
        expr: true,
        eqnull: true,
        // predefined globals
        predef: [
          'afterEach',
          'beforeEach',
          'describe',
          'expect',
          'it',
          'jasmine',
          'require',
          'spyOn',
          'createSpy',
          'console',
          'escape',
          'unescape',
          'runs',
          'xit',
          'xdescribe',
          'waitsFor'
        ]
      }
    },

    jasmine_node: {
      projectRoot: './test',
      requirejs: './test/jasmine_node_setup.js',
      forceExit: true
    },

    jsdoc : {
      api : {
        src: ['src/**/*', 'README.md'],
        dest: 'doc/jsdoc',
        options: {
          destination: 'doc/jsdoc'
        }
      }
    },

    requirejs: {
      install: {
        options: {
          baseUrl: 'src',
          almond: true,
          include: ['couchook.js'],
          paths: {
            package_path: '.'
          },
          wrap: {
            start: '(function() {',
            end: 'var Couchook = require("couchook.js"); window.couchook = new Couchook();}());'
          },
          out: 'bin/couchook.js',
          optimize: 'uglify'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('default', ['jshint', 'jasmine_node']);
  grunt.registerTask('install', 'Installing couchook', function() {
    grunt.task.run('requirejs:install');
  });
  grunt.registerTask('deploy', 'Deploying couchook', function() {
    grunt.task.run('install');
    grunt.task.run('site');
  });
  grunt.registerTask('site', 'Creating site', function() {
    grunt.task.run('jsdoc');
    exec('node node_modules/madge/bin/madge --format amd --exclude "util/lodash|util/class_util" --image doc/dependencies.png src/', 
      function(error, stdout, stderr) {
        if (error) {
          grunt.fatal('Error occurred executing "madge": ' + stderr);
        } else {
          grunt.log.ok('dependency graph created');
        }
      });
  });
};
