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

var root = path.join(__dirname, '..');
var rootL3D = path.join(root, 'js/L3D');
var build = path.join(root, 'build');
var buildL3D = path.join(build, 'L3D');

gulp.task('install-L3D', function(done) {

    exec('cd ' + rootL3D + ' && npm install', done);

});

gulp.task('compile-L3D-backend', ['install-L3D'], function(done) {

    var nodeModules = {};
    fs.readdirSync(path.join(root, 'js/L3D/node_modules'))
        .filter(function(x) {
            return ['.bin'].indexOf(x) === -1;
        })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });


    var backendConfig = {
        entry: path.join(rootL3D, 'L3D.ts'),
        output: {
            filename: path.join(buildL3D, 'L3D.js'),
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
            configFileName: path.join(root, 'js/L3D/tsconfig-backend.json')
        }
    };

    process.chdir(root);
    mkdirp('./build/L3D');
    webpack(backendConfig).run(function(err, stats) {
        if (err) {
            console.log('Error ', err);
        } else {
            async.parallel([
                    function(callback) {
                        ncp(path.join(rootL3D, 'd.ts'), path.join(buildL3D, 'd.ts'), function(err) {
                            if (err)
                                console.log(err);
                            callback();
                        });
                    },
                    function(callback) {
                        ncp(path.join(rootL3D,'package.json'), path.join(buildL3D,'package.json'), function(err) {
                            if (err)
                                console.log(err);
                            callback();
                        });
                    }
            ], function() {
                console.log(stats.toString());
                done();
            });
        }
    });
});

gulp.task('build-L3D-backend', ['compile-L3D-backend'], function(done) {

    exec('cd ' + buildL3D + ' && npm install', done)
        .stdout.on('data', (data) => process.stdout.write(data));

});
