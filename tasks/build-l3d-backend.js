var gulp = require('gulp');
var async = require('async');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ncp = require('ncp');
var path = require('path');
var mkdirp = require('mkdirp');
var rmdir = require('rimraf');
var exec = require('child_process').exec;
var task = require('./create-task.js')(__filename);

var root = path.join(__dirname, '..');
var rootl3d = path.join(root, 'l3d');
var buildl3d = path.join(root, 'l3d', 'build');

task('compile-l3d-backend', ['prepare-l3d'], path.join(rootl3d) + "/**", function(done) {

    var nodeModules = {};
    try {
        fs.readdirSync(path.join(root, 'l3d/node_modules'))
            .filter(function(x) {
                return ['.bin'].indexOf(x) === -1;
            })
        .forEach(function(mod) {
            nodeModules[mod] = 'commonjs ' + mod;
        });
    } catch (err) {
        // nodeModules will stay empty
    }


    var backendConfig = {
        entry: path.join(rootl3d, 'src', 'l3d.ts'),
        output: {
            filename: path.join(buildl3d, 'l3d.js'),
            libraryTarget: 'commonjs'
        },
        target: 'node',
        resolve: {
            extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
        },
        module: {
            loaders: [
                // note that babel-loader is configured to run after ts-loader
            { test: /\.ts(x?)$/, loader: 'ts-loader' }
            ]
        },
        externals: nodeModules,
        plugins: [
            new webpack.BannerPlugin('require("source-map-support").install();',
                    { raw: true, entryOnly: false })
        ],
        devtool:'sourcemap',
        ts: {
            configFileName: path.join(rootl3d, 'tsconfig-backend.json')
        }
    };

    webpack(backendConfig).run(function(err, stats) {
        if (err) {
            console.log('Error ', err);
        } else {
            console.log(stats.toString());
            done();
        }
    });
});

task('build-l3d-backend', ['compile-l3d-backend']);
