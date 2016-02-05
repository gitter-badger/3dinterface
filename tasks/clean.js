var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var rmdir = require('rimraf');

gulp.task('clean', function(done) {
    process.chdir(path.join(__dirname, '..'));
    rmdir('./build/', done)
});
