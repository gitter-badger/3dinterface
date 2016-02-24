var webpack = require('webpack');
var path = require('path');

webpack({
    entry: path.join(__dirname, './main.ts'),
    output: {
        libraryTarget: 'var',
        library: 'config',
        filename: path.join(__dirname, '../server/build/static/js/demo.js'),
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
        "config":"config",
        "l3d":"l3d",
        "l3dp":"l3dp",
        "three":"THREE",
        "Stats":"Stats"
    },
    plugins: [
        require('webpack-fail-plugin')
    ],
    devtool:'sourcemap',
    ts: {
        configFileName:'./tsconfig.json',
        silent:true

    }
}, function(err, stats) {
    if (err !== null)
        process.stderr.write(stats.toString('errors-only') + '\n');
});
