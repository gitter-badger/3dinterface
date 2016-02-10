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
var task = require('./create-task.js');

var root = path.join(__dirname, '..');
var rootServer = path.join(root, 'server');
var build = path.join(root, 'build');
var buildServer = path.join(build, 'server');

// Views
task('build-server-views-controllers', rootServer + "/**", function(done) {
    process.chdir(rootServer);

    async.forEach(fs.readdirSync('controllers'), function(name, done) {

        try {
            if (fs.statSync(path.join('./controllers', name, 'views')).isDirectory()) {
                mkdirp(path.join('../build/server/controllers', name, 'views'));
                merge(path.join('./controllers/', name, 'views'), path.join('../build/server/controllers', name, 'views'));
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
    mkdirp('./build/server/views');
    merge('./server/views', './build/server/views');
    done();
});

task(
    'build-server-views',
    ['build-server-views-controllers', 'build-server-views-global']
);

task(
    'compile-server',
    ['build-L3D-backend', 'prepare-server'],
    path.join(rootServer) + '/*.json',
    function(done) {
        async.parallel([
                function(done) {
                    exec('tsc', {cwd:rootServer}, done)
                        .stdout.on('data', (data) => process.stdout.write(data));
                },
                function(done) {
                    ncp(path.join(rootServer, 'package.json'), path.join(buildServer, 'package.json'), done);
                }
        ], done);
    }
);

task(
    'build-server-packages',
    ['compile-server', 'build-server-views', 'build-server-static'],
    path.join(buildServer, 'package.json'),
    function(done) {
        exec('npm install', {cwd:buildServer}, done)
            .stdout.on('data', (data) => process.stdout.write(data));
    }
);

task('build-server-L3D', ['compile-server', 'build-L3D-backend'], path.join(build, 'L3D') + "/**", function(done) {
    exec('npm install ../L3D', {cwd:buildServer}, done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

task('build-server', ['build-server-packages', 'build-server-L3D']);
