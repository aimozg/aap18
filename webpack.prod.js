/*
 * Created by aimozg on 07.12.2022.
 */
const path = require("path");
const {merge} = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.config.js');

module.exports = merge(common, {
    mode: 'production',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    mangle: false,
                    compress: false
                },
            }),
        ]
    }
});
