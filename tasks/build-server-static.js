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

task('build-server-static', path.join(root, 'static') + "/**", function(done) {
    process.chdir(root);
    mkdirp('./build/server/static');
    merge('./static', './server/build/static', 'overwrite');
    done();
});
