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
var rootCube = path.join(root, 'bouncing-cube');
var rootBuild = path.join(root, '/server/build/static/js/bouncing.min.js');

var frontendConfig = {
    entry: path.join(rootCube, 'main.ts'),
    output: {
        filename: rootBuild,
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
        l3d : 'l3d',
        'socket.io': 'io',
        'socket.io-client':'io'
    },
    devtool:'sourcemap',
    ts: {
        configFileName: path.join(rootCube, 'tsconfig.json')
    }
};

task('build-bouncing-cube', [], rootCube + "/**", function(done) {

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
