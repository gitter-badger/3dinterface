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

gulp.task('static', function(done) {
    process.chdir(path.join(__dirname, '../'));
    mkdirp('./build/server/static');
    merge('./static', './build/server/static');
    done();
});
