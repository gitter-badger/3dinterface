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

gulp.task('prepare-server', function(done) {
    exec('cd ' + rootServer + ' && tsd install', done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

gulp.task('compile-server', ['prepare-server', 'install-dev-L3D'], function(done) {
    exec('cd ' + rootServer + ' && tsc', done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

gulp.task('install-server-packages', ['compile-server', 'build-L3D-backend'], function(done) {
    exec('cd ' + buildServer + ' && npm install', done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

gulp.task('install-server-L3D', ['compile-server', 'build-L3D-backend'], function(done) {
    exec('cd ' + buildServer + ' && npm install ../L3D', done)
        .stdout.on('data', (data) => process.stdout.write(data));
});


gulp.task('install-dev-L3D', ['build-L3D-backend'], function(done) {
    exec('cd ' + rootServer + ' && npm install ../build/L3D', done)
        .stdout.on('data', (data) => process.stdout.write(data));
});

gulp.task('controllers-views', function(done) {
    process.chdir(rootServer);

    async.forEach(fs.readdirSync('controllers'), function(name, done) {

        try {
            if (fs.statSync(path.join('./controllers', name, 'views')).isDirectory()) {
                mkdirp(path.join('../build/server/controllers', name, 'views'));
                merge(path.join('./controllers/', name, 'views'), path.join('../build/server/controllers', name, 'views'),done);
            }
        } catch(e) {
            done();
        }

    }, done);
});

gulp.task('global-views', function(done) {
    process.chdir(root);
    mkdirp('./build/server/views');
    merge('./server/views', './build/server/views', done);
});

gulp.task('views', ['controllers-views', 'global-views'], function(done) { done(); });

gulp.task('install-server-dependencies', ['install-server-packages', 'install-server-L3D'], function(done) {
    done();
});

gulp.task('build-server', ['compile-server', 'install-server-dependencies', 'static', 'views'], function(done) {
    done();
});
