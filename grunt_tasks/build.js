var exec = require('child_process').exec;

module.exports = function(grunt) {

  'use strict';

  //var semver = require('semver');
  var packageFile = 'package.json';

  grunt.registerTask('site', 'Creating site', function() {
    grunt.task.run('jsdoc');
    exec('node node_modules/madge/bin/madge --format amd --exclude "util/lodash|util/class_util" --image doc/dependencies.png src/', function(error, stdout, stderr) {
      if (error) {
        grunt.fatal('Error occurred executing "madge": ' + stderr);
      } else {
        grunt.log.ok('dependency graph created');
      }
    });

    exec('npm test --coverage', function(error, stdout, stderr) {
      grunt.task.run(
        'copy:coverage',
        'clean:coverage'
      );
      grunt.log.ok('coverage report created');
    });
  });

  grunt.registerTask('install', 'Installing couchook', function() {
    grunt.task.run(
      'requirejs:install',
      'site'
    );
  });

  grunt.registerTask('deploy', 'Deploying couchook', function() {
    grunt.task.run('install');    
  });
};