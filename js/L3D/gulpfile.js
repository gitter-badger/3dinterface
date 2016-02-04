var gulp = require('gulp');
var async = require('async');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ncp = require('ncp');

var nodeModules = {};
fs.readdirSync('node_modules')
.filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
})
.forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
});

var config = {
    entry: './L3D.ts',
    output: {
        filename: 'build/L3D.js',
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
}

gulp.task('build-backend', function(done) {
    webpack(config).run(function(err, stats) {
        if (err) {
            console.log('Error ', err);
        } else {
            ncp('src/d.ts', 'obj/src/d.ts', function(err) {
                console.log(stats.toString());
                done();
            });
        }
    });
});


gulp.task('clean', function(done) {

    async.parallel([
            function(callback) { fs.unlink('./build', callback); },
            function(callback) { fs.unlink('./obj'  , callback); }
    ],
    function(err,results) {
        done();
    }
    );

});
