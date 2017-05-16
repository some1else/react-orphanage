/* jshint node: true */
var path = require('path');

module.exports = {
	entry: './src/index.js',

	output: {
		path: path.resolve(__dirname, 'lib'),
		filename: 'index.js',
		libraryTarget: 'umd',
		library: 'react-orphanage',
	},

	externals: {
		'react': 'react',
		'react-dom': 'react-dom',
	},

	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
		],
	},

	resolve: {
		extensions: ['', '.js', '.jsx'],
	},
};
