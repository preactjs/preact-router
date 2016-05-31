import babel from 'rollup-plugin-babel';

export default {
	plugins: [
		babel({
			babelrc: false,
			presets: ['es2015-rollup', 'stage-0', 'react'],
			exclude: 'node_modules/**'
		})
	]
};
