var fs = require('fs');
var webpack = require('webpack');

var nodeModules = {};
try {
    fs.readdirSync('./node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });
} catch (err) {
    // nodeModules will stay empty
}

module.exports = {
    entry: './src/l3dp.ts',
    output: {
        filename: './build/l3dp.js',
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
        configFileName: './tsconfig-backend.json'
    }
};
