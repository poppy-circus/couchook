module.exports = function(grunt) {

  "use strict";

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: ['grunt.js', 'grunt_tasks/*.js', 'src/**/!(lodash|)*.js', 'test/**/*.js'],
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

    copy: {
      coverage: {
        files: [
          { src: ['**'], dest: 'doc/coverage', expand: true, cwd: 'coverage/lcov-report/'}
        ]
      }
    },

    clean: {
      coverage: ['coverage']
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
          name: '../node_modules/almond/almond',
          out: 'bin/couchook.js',
          optimize: 'uglify'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.loadTasks('grunt_tasks');

  grunt.registerTask('default', ['jshint', 'jasmine_node']);
};
