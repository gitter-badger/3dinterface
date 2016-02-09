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

var root = path.join(__dirname, '..');
var rootServer = path.join(root, 'server');
var build = path.join(root, 'build');
var buildServer = path.join(build, 'server');

// NPM
gulp.task('prepare-server-packages-npm', function(done) {
    exec('cd ' + rootServer + ' && npm install', done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

// Typings
gulp.task('prepare-server-packages-custom-typings', function(done) {
    process.chdir(root);
    mkdirp('./js/L3D/typings');
    merge('./custom_typings', './server/typings');
    done();
});

gulp.task('prepare-server-packages-tsd-typings', function(done) {
    exec('cd ' + rootServer + ' && tsd install', done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

gulp.task(
    'prepare-server-packages-typings',
    ['prepare-server-packages-tsd-typings', 'prepare-server-packages-custom-typings'],
    function(done) {
        done();
    }
);

gulp.task(
    'prepare-server-L3D',
    ['build-L3D-backend'],
    function(done) {
        exec('npm install ../build/L3D', {cwd:rootServer}, done);
    }
);


// Global
gulp.task(
    'prepare-server',
    ['prepare-server-packages-typings', 'prepare-server-packages-npm', 'prepare-server-L3D'],
    function(done) {
        exec('cd ' + rootServer + ' && tsd install', done)
            .stdout.on('data', (data) => process.stdout.write(data));
    }
);

