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
var rootL3DP = path.join(root, 'js/apps/L3DP');
var build = path.join(root, 'build');
var buildL3DP = path.join(build, 'L3DP');

task('prepare-L3DP', ['prepare-apps', 'build-L3D-backend'], path.join(rootL3DP, 'package.json'), function(done) {

    exec('npm install', {cwd:rootL3DP}, done)
        .stdout.on('data', (data) => process.stdout.write(data));

});

task('compile-L3DP-backend', ['prepare-L3DP'], path.join(rootL3DP) + "/**", function(done) {

    var nodeModules = {};
    fs.readdirSync(path.join(root, 'js/apps/L3DP/node_modules'))
        .filter(function(x) {
            return ['.bin'].indexOf(x) === -1;
        })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });


    var backendConfig = {
        entry: path.join(rootL3DP, 'L3DP.ts'),
        output: {
            filename: path.join(buildL3DP, 'L3DP.js'),
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
            configFileName: path.join(root, 'js/apps/L3DP/tsconfig-backend.json')
        }
    };

    process.chdir(root);
    mkdirp('./build/L3DP');
    webpack(backendConfig).run(function(err, stats) {
        if (err) {
            console.log('Error ', err);
        } else {
            ncp(path.join(rootL3DP,'package.json'), path.join(buildL3DP,'package.json'), function(err) {
                if (err)
                    console.log(err);
                done();
            });
        }
    });
});

task('build-L3DP-backend', ['compile-L3DP-backend'], path.join(buildL3DP, 'package.json'), function(done) {

    exec('npm install', {cwd:buildL3DP}, done)
        .stdout.on('data', (data) => process.stdout.write(data));

});
