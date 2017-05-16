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
		'react': 'React',
		'react-dom': 'ReactDOM',
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
