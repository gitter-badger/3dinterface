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
var rootl3d = path.join(root, 'l3d');

var frontendConfig = {
    entry: './l3d/src/l3d.ts',
    output: {
        libraryTarget: 'var',
        library: 'l3d',
        filename: './server/build/static/js/l3d.js',
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
        configFileName: path.join(root, 'l3d/tsconfig-frontend.json')
    }
};

task('build-l3d-frontend', ['prepare-l3d'], rootl3d + "/**", function(done) {
    process.chdir(root);
    mkdirp('./server/build/static/js/');
    webpack(frontendConfig).run(function(err, stats) {
        rimraf('./tmp/l3d/', {}, function() {
            if (err) {
                console.log('Error ', err);
            } else {
                console.log(stats.toString());
                done();
            }
        });
    });
});

