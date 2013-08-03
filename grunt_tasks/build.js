var exec = require('child_process').exec;

module.exports = function(grunt) {

  'use strict';

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

  grunt.registerTask('deploy-version', 'Deploying couchook - set artifact version', function() {
    var currentVersion = grunt.config('project.currentVersion');
    var deployVersion = grunt.config('deploy.version');
    var asyncDone = this.async();

    if (currentVersion && deployVersion) {
      if (currentVersion === deployVersion) {
        grunt.log.ok('Skipped, package.json version (' + deployVersion + ') already up-to-date');
        asyncDone();
      } else {
        var packageJson = grunt.file.readJSON('package.json');
        packageJson.version = deployVersion;
        grunt.file.write('package.json', JSON.stringify(packageJson, null, '  '));

        exec([
          'git add package.json && ',
          'git commit -m "Version updated to ' + deployVersion + '"'
        ].join(''), function(error, stdout, stderr) {
          if (error) {
            grunt.fatal('Error occurred executing "git add & commit for package.json' + stderr);
            asyncDone(false);
          } else {
            grunt.log.ok('Version updated to ' + deployVersion);
            asyncDone();
          }
        });
      }
    } else {
      grunt.fatal('No version found, use or restart grunt deploy');
    }
  });

  grunt.registerTask('deploy-tagname', 'Deploying couchook - create git tag', function() {
    if (!grunt.config('deploy.tagname')) {
      grunt.log.ok('Skip creating git tag.');
    } else {
      grunt.log.ok('Creating git tag.');
    }
  });

  grunt.registerTask('deploy-nexus', 'Deploying couchook - copy artifacts to nexus', function() {
    console.log(grunt.config('deploy.nextVersion'));
  });

  grunt.registerTask('deploy-next-version', 'Deploying couchook - set development version', function() {
    console.log(grunt.config('deploy.nextVersion'));
  });

  grunt.registerTask('deploy', [
    'prompt:deploy',
    'deploy-version',
    'deploy-tagname',
    'deploy-nexus',
    'deploy-next-version'
  ]);
};