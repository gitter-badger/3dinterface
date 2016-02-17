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
var rootl3dp = path.join(root, 'js/apps/l3dp');
var build = path.join(root, 'build');
var buildl3dp = path.join(build, 'l3dp');

task('prepare-l3dp', ['prepare-apps', 'build-L3D-backend'], path.join(rootl3dp, 'package.json'), function(done) {

    exec('npm install', {cwd:rootl3dp}, done)
        .stdout.on('data', (data) => process.stdout.write(data));

});

task('compile-l3dp-backend', ['prepare-l3dp'], path.join(rootl3dp) + "/**", function(done) {

    var nodeModules = {};
    fs.readdirSync(path.join(root, 'js/apps/l3dp/node_modules'))
        .filter(function(x) {
            return ['.bin'].indexOf(x) === -1;
        })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });


    var backendConfig = {
        entry: path.join(rootl3dp, 'l3dp.ts'),
        output: {
            filename: path.join(buildl3dp, 'l3dp.js'),
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
            configFileName: path.join(root, 'js/apps/l3dp/tsconfig-backend.json')
        }
    };

    process.chdir(root);
    mkdirp('./build/l3dp');
    webpack(backendConfig).run(function(err, stats) {
        if (err) {
            console.log('Error ', err);
        } else {
            ncp(path.join(rootl3dp,'package.json'), path.join(buildl3dp,'package.json'), function(err) {
                if (err)
                    console.log(err);
                done();
            });
        }
    });
});

task('build-l3dp-backend', ['compile-l3dp-backend'], path.join(buildl3dp, 'package.json'), function(done) {

    exec('npm install', {cwd:buildl3dp}, done)
        .stdout.on('data', (data) => process.stdout.write(data));

});
