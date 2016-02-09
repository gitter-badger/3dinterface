var gulp = require('gulp');
var shell = require('gulp-shell');
var changed = require('gulp-changed');
var path = require('path');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;

var root = path.join(__dirname, '..');
var rootL3D = path.join(root, 'js/L3D');

gulp.task('prepare-L3D-npm', function(done) {

    var src = path.join(rootL3D, 'package.json');
    var dest = path.join(rootL3D, 'node_modules');

    return gulp.src(src)
        .pipe(changed(dest))
        .pipe(shell('npm install', {cwd:rootL3D}))
        .pipe(gulp.dest(dest));
});

gulp.task('prepare-L3D-tsd-typings', function(done) {

    var src = path.join(rootL3D, 'tsd.json');
    var dest = path.join(rootL3D, 'typings');

    return gulp.src(src)
        .pipe(changed(dest))
        .pipe(shell('tsd install', {cwd:rootL3D}))
        .pipe(gulp.dest(dest));

});

gulp.task('prepare-L3D-custom-typings', function(done) {

    var src = path.join(root, 'custom_typings') + '/*';
    var dest = path.join(rootL3D, 'typings');

    return gulp.src(src)
        .pipe(changed(dest))
        .pipe(gulp.dest(dest));

});

gulp.task('prepare-L3D-typings', ['prepare-L3D-tsd-typings', 'prepare-L3D-custom-typings']);

gulp.task('prepare-L3D', ['prepare-L3D-npm', 'prepare-L3D-typings']);
