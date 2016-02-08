var gulp = require('gulp');
var async = require('async');
var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ncp = require('ncp');
var path = require('path');
var mkdirp = require('mkdirp');

var frontendConfig = {
    entry: './js/L3D/L3D.ts',
    output: {
        libraryTarget: 'var',
        library: 'L3D',
        filename: './build/server/static/js/L3D/L3D.js',
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
    devtool:'sourcemap'
};

gulp.task('build-L3D-frontend', function(done) {
    process.chdir(path.join(__dirname, '../'));
    mkdirp('./build/server/static/js/L3D');
    webpack(frontendConfig).run(function(err, stats) {
        if (err) {
            console.log('Error ', err);
        } else {
            console.log(stats.toString());
            done();
        }
    });
});

