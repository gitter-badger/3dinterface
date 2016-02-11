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
var rootL3D = path.join(root, 'js/L3D');

var frontendConfig = {
    entry: './js/L3D/L3D.ts',
    output: {
        libraryTarget: 'var',
        library: 'L3D',
        filename: './build/server/static/js/L3D.js',
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
        'socket.io-client':'io'
    },
    devtool:'sourcemap',
    ts: {
        configFileName: path.join(root, 'js/L3D/tsconfig-frontend.json')
    }
};

task('build-L3D-frontend', ['prepare-L3D'], rootL3D + "/**", function(done) {
    process.chdir(root);
    mkdirp('./build/server/static/js/');
    webpack(frontendConfig).run(function(err, stats) {
        rimraf('./build/tmp', {}, function() {
            if (err) {
                console.log('Error ', err);
            } else {
                console.log(stats.toString());
                done();
            }
        });
    });
});

