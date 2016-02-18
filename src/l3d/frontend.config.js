module.exports = {
    entry: './src/l3d.ts',
    output: {
        libraryTarget: 'var',
        library: 'l3d',
        filename: '../server/build/static/js/l3d.js',
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
    devtool:'sourcemap',
    ts: {
        configFileName:'./tsconfig-frontend.json'
    }
};
