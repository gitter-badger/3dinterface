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
var build = path.join(root, 'build');
var buildServer = path.join(build, 'server');

// Views
task('build-server-views-controllers', rootServer + "/**.js", function(done) {
    process.chdir(rootServer);

    async.forEach(fs.readdirSync('controllers'), function(name, done) {

        try {
            if (fs.statSync(path.join('./controllers', name, 'views')).isDirectory()) {
                mkdirp(path.join('../build/server/controllers', name, 'views'));
                merge(path.join('./controllers/', name, 'views'), path.join('../build/server/controllers', name, 'views'), 'overwrite');
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
    merge('./server/views', './build/server/views', 'overwrite');
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

task('build-server-l3d', ['compile-server', 'build-l3d-backend'], path.join(build, 'l3d') + "/**", function(done) {
    exec('npm install ../l3d', {cwd:buildServer}, done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

task('build-server', ['build-server-packages', 'build-server-l3d']);
