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
					'preact-router': __dirname+'/src/index.js',
					src: __dirname+'/src'
				}
			}
		},

		mochaReporter: {
			showDiff: true
		},

		webpackMiddleware: {
			noInfo: true
		}
	});
};
