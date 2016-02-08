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

var nodeModules = {};
fs.readdirSync(path.join(__dirname, '../js/L3D/node_modules'))
.filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
})
.forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
});

var rootL3D = path.join(__dirname, '../js/L3D');
var build = path.join(__dirname, '../build');
var buildL3D = path.join(build, 'L3D');

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
    devtool:'sourcemap'
};

gulp.task('build-L3D-backend', function(done) {
    process.chdir(path.join(__dirname, '../'));
    mkdirp('./build/server/');
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
