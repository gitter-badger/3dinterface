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

gulp.task('doc', function(done) {
    process.chdir(path.join(__dirname, '../'));
    rmdir('./doc/out', function(err) {

        if (err)
            console.log(err);

        mkdirp('./doc/out');
        exec('typedoc ' +
            'js/L3D/ server/geo/ server/controllers/prototype/ '  +
            '--exclude server/controllers/prototype/index.ts ' +
            '--exclude server/controllers/prototype/urls.ts ' +
            '--exclude typings/ ' +
            '--exclude "*.d.ts" ' +
            '--includes js/L3D/ --includes server/geo/ ' +
            '--out doc/out/ ' +
            '--mode file ' +
            '--name l3d ' +
            '--module commonjs ' +
            '--readme readme.md',
            {maxBuffer:Infinity},
            done
        );
    });
});
