var gulp = require('gulp');
var async = require('async');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ncp = require('ncp');
var path = require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var task = require('./create-task.js')(__filename);

var root = path.join(__dirname, '..');
var rootL3DP = path.join(root, 'js/apps/L3DP');

var frontendConfig = {
    entry: './js/apps/L3DP/L3DP.ts',
    output: {
        libraryTarget: 'var',
        library: 'L3DP',
        filename: './build/server/static/js/L3DP.js',
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
        'socket.io': 'io',
        'socket.io-client':'io',
        'stats':'Stats',
        'config':'Config',
        'jQuery':'$',
        'L3D':'L3D'
    },
    devtool:'sourcemap',
    ts: {
        configFileName: path.join(root, 'js/apps/L3DP/tsconfig-frontend.json')
    }
};

task('build-L3DP-frontend', ['prepare-apps'], rootL3DP + "/**", function(done) {
    process.chdir(root);
    mkdirp('./build/server/static/js/');
    webpack(frontendConfig).run(function(err, stats) {
        rimraf('./build/tmp', {}, function() {
            if (err) {
                console.log('Error ', err);
                done(err);
            } else {
                console.log(stats.toString());
                done();
            }
        });
    });
});

