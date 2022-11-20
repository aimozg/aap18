const path = require('path');
const webpack = require('webpack');

module.exports = {
	mode: "development",
	entry: ['./src/extensions.ts', './src/index.tsx'],
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}, {
				test: /\.s[ac]ss$/i,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader",
				],
			},
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			PACKAGE_VERSION: JSON.stringify(require('./package.json').version)
		})
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
};
