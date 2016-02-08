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

var nodeModules = {};
fs.readdirSync(path.join(__dirname, '../server/node_modules'))
.filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
})
.forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
});

var rootServer = path.join(__dirname, '../server');
var build = path.join(__dirname, '../build');
var buildServer = path.join(build, 'server');

var config = {
    entry: path.join(rootServer, 'server.ts'),
    output: {
        filename: path.join(buildServer, 'server.js'),
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
        compilerOptions : {
            "module":"commonjs",
            "noImplicitAny": true,
            "removeComments": true,
            "preserveConstEnums": true,
            "outDir":path.join(rootServer, '../build/server'),
            "sourceMap": true,
            "declaration":true,
            "rootDir":rootServer
        }
    }
};

gulp.task('build-server', function(done) {
    process.chdir(path.join(__dirname, '../server/'));
    exec('tsc', done);
});
