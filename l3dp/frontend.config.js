module.exports = {
    entry: './src/l3dp.ts',
    output: {
        libraryTarget: 'var',
        library: 'l3dp',
        filename: '../server/build/static/js/l3dp.js',
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
        'l3d':'l3d'
    },
    devtool:'sourcemap',
    ts: {
        configFileName: './tsconfig-frontend.json'
    }
};
