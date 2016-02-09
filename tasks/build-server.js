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

// Views
gulp.task('build-server-views-controllers', function(done) {
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

gulp.task('build-server-views-global', function(done) {
    process.chdir(root);
    mkdirp('./build/server/views');
    merge('./server/views', './build/server/views');
    done();
});

gulp.task(
    'build-server-views',
    ['build-server-views-controllers', 'build-server-views-global'],
    function(done) {
        done();
    }
);

gulp.task('compile-server', ['build-L3D-backend', 'prepare-server'], function(done) {
    async.parallel([
        function(done) {
            exec('cd ' + rootServer + ' && tsc', done)
                .stdout.on('data', (data) => process.stdout.write(data));
        },
        function(done) {
            ncp(path.join(rootServer, 'package.json'), path.join(buildServer, 'package.json'), done);
        }
    ], done);
});

gulp.task('build-server-packages', ['compile-server', 'build-server-views', 'build-server-static'], function(done) {
    exec('cd ' + buildServer + ' && npm install', done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

gulp.task('build-server-L3D', ['compile-server', 'build-L3D-backend'], function(done) {
    exec('cd ' + buildServer + ' && npm install ../L3D', done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

gulp.task('build-server', ['build-server-packages', 'build-server-L3D'], function(done) {
    done();
});
