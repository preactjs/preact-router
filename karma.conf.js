module.exports = function(config) {
	config.set({
		frameworks: ['mocha', 'chai-sinon'],
		reporters: ['mocha'],
		browsers: ['PhantomJS'],

		files: ['test/**/*.js'],

		preprocessors: {
			'{src,test}/**/*.js': ['webpack', 'sourcemap']
		},

		webpack: {
			module: {
				loaders: [{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					loader: 'babel'
				}]
			},
			resolve: {
				alias: {
					src: __dirname+'/src'
				}
			}
		},

		webpackMiddleware: {
			noInfo: true
		}
	});
};
