var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: "./src/index.jsx",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    // must be 'source-map' or '-source-map'
    devtool: 'inline-source-map',
    module: {
        loaders: [
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract(
                // activate source maps via loader query
                'css?sourceMap!less?sourceMap')
            }, {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015']
                }
            }
        ]
    },
    plugins: [// extract inline css into separate 'styles.css'
        new ExtractTextPlugin('styles.css')]
}
