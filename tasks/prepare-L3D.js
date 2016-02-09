var gulp = require('gulp');
var path = require('path');
var merge = require('merge-dirs').default;
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;

var root = path.join(__dirname, '..');
var rootL3D = path.join(root, 'js/L3D');

gulp.task('prepare-L3D-npm', function(done) {
    exec('cd ' + rootL3D + ' && npm install', done);
});

gulp.task('prepare-L3D-tsd-typings', function(done) {
    exec('cd ' + rootL3D + ' && tsd install', done);
});

gulp.task('prepare-L3D-custom-typings', function(done) {
    process.chdir(root);
    mkdirp('./js/L3D/typings');
    merge('./custom_typings', './js/L3D/typings');
    done();
});

gulp.task('prepare-L3D-typings', ['prepare-L3D-tsd-typings', 'prepare-L3D-custom-typings'], function(done) {
    done();
});

gulp.task('prepare-L3D', ['prepare-L3D-npm', 'prepare-L3D-typings'], function(done) {
    done();
});
