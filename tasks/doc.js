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

gulp.task('client-doc', function(done) {
    process.chdir(path.join(__dirname, '../'));
    rmdir('./doc/client', function(err) {

        if (err)
            console.log(err);

        exec('typedoc ' +
            'js/L3D/ '  +
            '--includes js/L3D/ ' +
            '--out doc/client/ ' +
            '--mode file ' +
            '--name l3d ' +
            '--module commonjs ' +
            '--readme readme.md',
            {maxBuffer:Infinity},
            done
        );
    });
});

gulp.task('server-doc', function(done) {
    process.chdir(path.join(__dirname, '../'));
    rmdir('./doc/server', function(err) {

        if (err)
            console.log(err);

        exec('typedoc ' +
            'server/geo/ server/controllers/prototype/ '  +
            '--exclude server/controllers/prototype/index.ts ' +
            '--exclude server/controllers/prototype/urls.ts ' +
            '--includes server/geo/ ' +
            '--out doc/sever/ ' +
            '--mode file ' +
            '--name l3d ' +
            '--module commonjs ' +
            '--readme readme.md',
            {maxBuffer:Infinity},
            done
        );
    });
});

gulp.task('doc', ['client-doc', 'server-doc'], function(done) { done(); });

gulp.task('all-doc', function(done) {
    process.chdir(path.join(__dirname, '../'));
    rmdir('./doc/server', function(err) {

        if (err)
            console.log(err);

        exec('typedoc ' +
            'js/L3D/ server/geo/ server/controllers/prototype/ '  +
            '--exclude server/controllers/prototype/index.ts ' +
            '--exclude server/controllers/prototype/urls.ts ' +
            '--includes js/L3D/ --includes server/geo/ ' +
            '--out doc/all/ ' +
            '--mode file ' +
            '--name l3d ' +
            '--module commonjs ' +
            '--readme readme.md',
            {maxBuffer:Infinity},
            done
        );
    });
});
