var exec = require('child_process').exec;
var moment = require('moment');

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
      'jshint',
      'jasmine_node',
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
        grunt.log.ok('package.json updated - ' + deployVersion);

        exec([
          'git add package.json && ',
          'git commit -m "Update version for deployment to ' + deployVersion + '"'
        ].join(''), function(error, stdout, stderr) {
          if (error) {
            grunt.fatal('Error occurred while updating to deploy version' + stderr);
            asyncDone(false);
          } else {
            grunt.log.ok('Version updated for deployment ' + deployVersion);
            asyncDone();
          }
        });
      }
    } else {
      grunt.fatal('No version found, use or restart grunt deploy');
    }
  });

  grunt.registerTask('deploy-tagname', 'Deploying couchook - create git tag', function() {
    var tag = grunt.config('deploy.tagname');
    var asyncDone = this.async();

    if (!tag) {
      grunt.log.ok('Skip creating git tag.');
      asyncDone();
    } else {
      var date = moment().format('YYYY-MM-DD HH:mm');
      var name = 'CHANGELOG';
      var version = grunt.config('deploy.version');
      var content = [
       date + ' Create tag (' + tag + ') for version ' + version,
        '',
        ''
      ].join('\n');

      if (!grunt.file.findup(name)) {
        grunt.file.write(name, '');
      }

      grunt.file.write(name, '#' + content + grunt.file.read(name));
      grunt.log.ok('CHANGELOG updated - ' + content);

      exec([
        'git add CHANGELOG && ',
        'git commit -m "Update CHANGELOG for deployment (' + version + ')" && ',
        'git tag -a ' + tag + ' -m "' + content + '" && ',
        'git push --tags'
      ].join(''), function(error, stdout, stderr) {
        if (error) {
          grunt.fatal('Error occurred while tagging' + stderr);
          asyncDone(false);
        } else {
          grunt.log.ok('Tag created: ' + tag);
          asyncDone();
        }
      });
    }
  });

  grunt.registerTask('deploy-nexus', 'Deploying couchook - copy artifacts to nexus', function() {
    var artifacts = grunt.config('deploy.includes');
    var docs = artifacts.indexOf('DOC') > -1;
    var nexus = artifacts.indexOf('NEXUS') > -1;
    var asyncDone = this.async();

    if (nexus) {
      if (grunt.file.exists('.nexus')) {
        var credentials = grunt.file.readJSON('.nexus');
        if (credentials.host && credentials.user && credentials.pass) {
          if (!docs) {
            grunt.task.run('clean:docs');
          }
          grunt.task.run('nexus');
          asyncDone();
        } else {
          grunt.fatal('Credentials incomplete, please provide host, user and pass!');
          asyncDone(false);
        }
      } else {
        grunt.fatal('No credentials available, please add .nexus file to root folder!');
        asyncDone(false);
      }
    } else {
      grunt.log.ok('Skip creating nexus artifacts, docs ignored.');
      asyncDone();
    }
  });

  grunt.registerTask('deploy-next-version', 'Deploying couchook - set development version', function(version) {
    version = version || grunt.config('deploy.nextVersion');
    var asyncDone = this.async();

    if (version) {
      var packageJson = grunt.file.readJSON('package.json');
      packageJson.version = version;
      grunt.file.write('package.json', JSON.stringify(packageJson, null, '  '));
      grunt.log.ok('package.json updated - ' + version);

      exec([
        'git add package.json && ',
        'git commit -m "Update to next version for development (' + version + ')" && ',
        'git push'
      ].join(''), function(error, stdout, stderr) {
        if (error) {
          grunt.fatal('Error occurred while updating to next development version' + stderr);
          asyncDone(false);
        } else {
          grunt.log.ok('Version updated for development ' + version);
          asyncDone();
        }
      });
    } else {
      grunt.fatal('No development version found, use or restart grunt deploy');
    }
  });

  grunt.registerTask(
    'nexus-upload',
    'Upload couchook artifact to nexus',
    function() {
      var version = grunt.file.readJSON('package.json').version;

      if (grunt.file.exists('.nexus')) {
        var credentials = grunt.file.readJSON('.nexus');
        var asyncDone = this.async();
        exec([
          'curl -v -F r=releases -F hasPom=false -F e=zip -F g=de.poppy-circus -F a=couchook -F v=' + version + ' ',
          '-F p=zip -F file=@bin/couchook.zip -u ' + credentials.user + ':' + credentials.pass + ' ' + credentials.host
        ].join(''), function(error, stdout, stderr) {
          if (error) {
            grunt.fatal('Error occurred executing "nexus-upload" ' + version + stderr);
            asyncDone(false);
          } else {
            grunt.log.ok('couchook ' + version + ' uploaded to nexus');
            asyncDone();
          }
        });
      } else {
        grunt.fatal('Missing credentials-file ".nexus", upload for couchook ' + version + ' stopped');
      }
    }
  );

  grunt.registerTask(
    'nexus',
    'Package and deploy the couchook build to nexus',
    function() {
      grunt.task.run(
        'copy:nexus',
        'compress:nexus',
        'nexus-upload',
        'clean:nexus'
      );
    }
  );

  grunt.registerTask('deploy', [
    'jshint',
    'jasmine_node',
    'prompt:deploy',
    'deploy-version',
    'deploy-tagname',
    'requirejs:install',
    'site',
    'deploy-nexus',
    'deploy-next-version'
  ]);
};