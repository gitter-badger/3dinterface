var gulp = require('gulp');
var shell = require('gulp-shell');
var changed = require('gulp-changed');
var path = require('path');
var mkdirp = require('mkdirp');
var merge = require('merge-dirs').default;
var exec = require('child_process').exec;
var task = require('./create-task.js');

var root = path.join(__dirname, '..');
var rootChanged = path.join(root, '.changed');
var rootL3D = path.join(root, 'js/L3D');
var rootChangedL3D = path.join(rootChanged, 'js/L3D');

task('prepare-L3D-npm', path.join(rootL3D, 'package.json'), function(done) {

    exec('npm install', {cwd:rootL3D}, done)
        .stdout.on('data', (data) => process.stdout.write(data));

});

task('prepare-L3D-tsd-typings', path.join(rootL3D, 'tsd.json'), function(done) {

    exec('tsd install', {cwd:rootL3D}, done)
        .stdout.on('data', (data) => process.stdout.write(data));

});

task('prepare-L3D-custom-typings', path.join(root, 'custom_typings') + "/**", function(done) {

    process.chdir(root);
    mkdirp('./js/L3D/typings');
    merge('./custom_typings', './js/L3D/typings', 'overwrite');
    done();

});

task('prepare-L3D-typings', ['prepare-L3D-tsd-typings', 'prepare-L3D-custom-typings']);

task('prepare-L3D', ['prepare-L3D-npm', 'prepare-L3D-typings']);
