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
var exec = require('child_process').exec;

var root = path.join(__dirname, '..');
var rootApps = path.join(root, 'js/apps');
var rootl3dp = path.join(rootApps, 'l3dp');

var frontendConfig = {
    entry: './js/apps/l3dp/l3dp.ts',
    output: {
        libraryTarget: 'var',
        library: 'l3dp',
        filename: './build/server/static/js/l3dp.js',
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
        configFileName: path.join(root, 'js/apps/l3dp/tsconfig-frontend.json')
    }
};

task('prepare-l3dp', ['build-L3D-backend'], path.join(rootl3dp, 'package.json'), function(done) {

    exec('npm install ../../build/L3D', {cwd:rootApps}, done)
        .stdout.on('data', (data)=>process.stdout.write(data));

});

task('build-l3dp-frontend', ['prepare-apps', 'prepare-l3dp'], rootl3dp + "/**", function(done) {
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

