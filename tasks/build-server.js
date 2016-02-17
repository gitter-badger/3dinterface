var gulp = require('gulp');
var async = require('async');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ncp = require('ncp');
var path = require('path');
var mkdirp = require('mkdirp');
var merge = require('merge-dirs').default;
var rmdir = require('rimraf');
var exec = require('child_process').exec;
var task = require('./create-task.js')(__filename);

var root = path.join(__dirname, '..');
var rootServer = path.join(root, 'server');
var buildServer = path.join(rootServer, 'build');

// Views
task('build-server-views-controllers', rootServer + "/**.js", function(done) {

    process.chdir(rootServer);

    async.forEach(fs.readdirSync('controllers'), function(name, done) {

        try {
            if (fs.statSync(path.join('./controllers', name, 'views')).isDirectory()) {
                mkdirp(path.join(buildServer, 'controllers', name, 'views'));
                merge(path.join('./controllers/', name, 'views'), path.join(buildServer, 'controllers', name, 'views'), 'overwrite');
                done();
            }
        } catch(e) {
            // Nothing to merge
            done();
        }

    }, done);
});

task('build-server-views-global', path.join(rootServer, 'views') + "/**",  function(done) {
    process.chdir(root);
    mkdirp(path.join(buildServer, 'views'));
    merge('./server/views', path.join(buildServer,'views'), 'overwrite');
    done();
});

task(
    'build-server-views',
    ['build-server-views-controllers', 'build-server-views-global']
);

task(
    'compile-server',
    ['build-l3d-backend', 'prepare-server'],
    path.join(rootServer) + "/**",
    function(done) {
        exec('tsc', {cwd:rootServer}, done)
            .stdout.on('data', (data) => process.stdout.write(data));
    }
);

task(
    'build-server-packages',
    ['compile-server', 'build-server-views', 'build-server-static'],
    path.join(buildServer, 'package.json'),
    function(done) {
        done();
        // exec('npm install', {cwd:buildServer}, done)
        //     .stdout.on('data', (data) => process.stdout.write(data));
    }
);

task('build-server-l3d', ['compile-server', 'build-l3d-backend']);

task('build-server', ['build-server-packages', 'build-server-l3d']);
