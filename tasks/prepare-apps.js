var gulp = require('gulp');
var shell = require('gulp-shell');
var changed = require('gulp-changed');
var webpack = require('webpack');
var rimraf = require('rimraf');
var path = require('path');
var mkdirp = require('mkdirp');
var merge = require('merge-dirs').default;
var exec = require('child_process').exec;
var task = require('./create-task.js')(__filename);

var root = path.join(__dirname, '..');
var rootApps = path.join(root, 'js/apps');

task('prepare-apps-tsd-typings', path.join(rootApps, 'tsd.json'), function(done) {

    done();
    // exec('tsd install', {cwd:rootApps}, done)
    //     .stdout.on('data', (data) => process.stdout.write(data));

});

task('prepare-apps-custom-typings', path.join(root, 'custom_typings') + "/**", function(done) {

    process.chdir(root);
    mkdirp('./js/apps/typings');
    merge('./custom_typings', './js/apps/typings', 'overwrite');
    done();

});

task('prepare-apps-typings', ['prepare-apps-tsd-typings', 'prepare-apps-custom-typings']);

task('prepare-apps-npm', ['build-l3d-backend'], path.join(root, 'js/l3d') + "/**", function(done) {

    done();
    // exec('npm install ../../build/l3d', {cwd:rootApps}, done)
    //     .stdout.on('data', (data) => process.stdout.write(data));


});

task('prepare-apps', ['prepare-apps-typings', 'prepare-apps-npm']);
