var gulp = require('gulp');
var shell = require('gulp-shell');
var changed = require('gulp-changed');
var path = require('path');
var mkdirp = require('mkdirp');
var merge = require('merge-dirs').default;
var exec = require('child_process').exec;
var task = require('./create-task.js')(__filename);

var root = path.join(__dirname, '..');
var rootChanged = path.join(root, '.changed');
var rootl3d = path.join(root, 'js/l3d');
var rootChangedl3d = path.join(rootChanged, 'js/l3d');

task('prepare-l3d-npm', path.join(rootl3d, 'package.json'), function(done) {

    exec('npm install', {cwd:rootl3d}, done)
        .stdout.on('data', (data) => process.stdout.write(data));

});

task('prepare-l3d-tsd-typings', path.join(rootl3d, 'tsd.json'), function(done) {

    exec('tsd install', {cwd:rootl3d}, done)
        .stdout.on('data', (data) => process.stdout.write(data));

});

task('prepare-l3d-custom-typings', path.join(root, 'custom_typings') + "/**", function(done) {

    process.chdir(root);
    mkdirp('./js/l3d/typings');
    merge('./custom_typings', './js/l3d/typings', 'overwrite');
    done();

});

task('prepare-l3d-typings', ['prepare-l3d-tsd-typings', 'prepare-l3d-custom-typings']);

task('prepare-l3d', ['prepare-l3d-npm', 'prepare-l3d-typings']);
