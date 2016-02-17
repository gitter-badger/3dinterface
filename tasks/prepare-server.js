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

// NPM
task('prepare-server-packages-npm', path.join(rootServer, 'package.json'), function(done) {
    exec('npm install', {cwd:rootServer}, done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

// Typings
task('prepare-server-packages-custom-typings', path.join(root, 'custom_typings') + "/**", function(done) {
    process.chdir(root);
    mkdirp('./js/l3d/typings');
    merge('./custom_typings', './server/typings', 'overwrite');
    done();
});

task('prepare-server-packages-tsd-typings', path.join(rootServer, 'tsd.json'), function(done) {
    exec('tsd install', {cwd:rootServer}, done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

task(
    'prepare-server-packages-typings',
    ['prepare-server-packages-tsd-typings', 'prepare-server-packages-custom-typings']
);

task(
    'prepare-server-l3d',
    ['build-l3d-backend'],
    path.join(build, 'l3d') + "/**"
);

task(
    'prepare-server-l3dp',
    ['build-l3dp-backend'],
    path.join(build, 'l3dp') + "/**",
    function(done) {
        exec('npm install ../build/l3dp', {cwd:rootServer}, done);
    }
);


// Global
task(
    'prepare-server',
    ['prepare-server-packages-typings', 'prepare-server-packages-npm', 'prepare-server-l3d', 'prepare-server-l3dp']
);

