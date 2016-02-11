var gulp = require('gulp');
var shell = require('gulp-shell');
var changed = require('gulp-changed');
var webpack = require('webpack');
var rimraf = require('rimraf');
var path = require('path');
var mkdirp = require('mkdirp');
var merge = require('merge-dirs').default;
var exec = require('child_process').exec;
var task = require('./create-task.js')(__filename);

var root = path.join(__dirname, '..');
var rootApps = path.join(root, 'js/apps');
var rootBuildApps = path.join(root, 'build/server/static/js/bouncing.min.js');

var frontendConfig = {
    entry: path.join(rootApps, 'bouncing-cube', 'main.ts'),
    output: {
        filename: rootBuildApps,
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js', '.json']
    },
    module: {
        loaders: [{
            test: /\.ts(x?)$/,
            loader: 'ts-loader'
        },
        {
            test: /\.json$/,
            loader: 'json-loader'
        }],
        exclude: /node_modules/
    },
    externals: {
        three : 'THREE',
        L3D : 'L3D',
        'socket.io': 'io',
        'socket.io-client':'io'
    },
    devtool:'sourcemap',
    ts: {
        configFileName: path.join(rootApps, 'bouncing-cube', 'tsconfig.json')
    }
};

task('build-bouncing-cube', ['prepare-apps-typings', 'build-L3D-frontend', 'build-L3D-backend'], path.join(rootApps, 'bouncing-cube') + "/**", function(done) {

    process.chdir(root);
    mkdirp('./build/server/static/js/L3D');
    webpack(frontendConfig).run(function(err, stats) {
        rimraf('./tmp/bouncing-cube', {}, function() {
            if (err) {
                console.log('Error ', err);
            } else {
                console.log(stats.toString());
                done();
            }
        });
    });

});
