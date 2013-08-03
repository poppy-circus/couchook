var semver = require('semver');
var getNextVersion = function(version) {
  var nextVersionArray = version.split('.');
  nextVersionArray[2] = parseInt(nextVersionArray[2], 10) + 1;
  nextVersionArray.length = 3;
  return nextVersionArray.join('.');
}

module.exports = function(grunt) {

  "use strict";

  // Project setup
  var packageJson = grunt.file.readJSON('package.json');
  var project = {
    currentVersion: packageJson.version,
    nextVersion: getNextVersion(packageJson.version)
  };

  // Project configuration.
  grunt.initConfig({
    project: project,

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

    prompt: {
      deploy: {
        options: {
          questions: [{
            config:  'deploy.includes',
            type:    'checkbox',
            message: 'Deployment details:',
            choices: [
              {
                value: 'NEXUS',
                name:  'Deploy to nexus'
              },
              {
                value: 'SCM',
                name:  'Create git tag',
                checked: true
              },
              {
                value: 'DOC',
                name:  'Deploy documentation'
              }
            ]
          }, {
            config: 'deploy.version',
            type: 'input',
            message: 'What is the version of the artifact to deploy?',
            default: project.currentVersion,
            validate: function(value) {
              var valid = !!semver.valid(value);
              var msg = 'Must be a valid semver, such as 1.2.3-rc1. See ' + 'http://semver.org/'.blue.underline + ' for more details.';

              if (valid) {
                valid = semver.gte(value, project.currentVersion);
                msg = 'Version not accepted, must be greater than ' + project.currentVersion;
              }

              //grunt-prompt message seems to be broken
              if (!valid) {
                grunt.log.error(msg);
              }

              project.updatedVersion = value;
              return valid || msg;
            }
          }, {
            config: 'deploy.tagname',
            type: 'input',
            message: 'What is the SCM tag of the artifact to deploy?',
            default: 'v' + project.currentVersion,
            validate: function(value) {
              var valid = value.length > 4;
              var msg = 'Must be a valid string with more than 4 digits';

              //grunt-prompt message seems to be broken
              if (!valid) {
                grunt.log.error(msg);
              }
              return valid || msg;
            },
            when: function(answers) {
              return answers['deploy.includes'].indexOf('SCM') > -1;
            }
          }, {
            config: 'deploy.nextVersion',
            type: 'input',
            message: 'What is the next version for development?',
            default: project.nextVersion,
            validate: function(value) {
              var valid = !!semver.valid(value);
              var msg = 'Must be a valid semver, such as 1.2.3-rc1. See ' + 'http://semver.org/'.blue.underline + ' for more details.';

              if (valid) {
                valid = semver.gt(value, project.updatedVersion);
                msg = 'Version not accepted, must be greater than ' + project.updatedVersion;
              }

              //grunt-prompt message seems to be broken
              if (!valid) {
                grunt.log.error(msg);
              }
              return valid || msg;
            }
          }]
        }
      },
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
  grunt.loadNpmTasks('grunt-prompt');

  grunt.loadTasks('grunt_tasks');

  grunt.registerTask('default', ['jshint', 'jasmine_node']);
};
