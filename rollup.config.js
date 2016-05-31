import babel from 'rollup-plugin-babel';
import memory from 'rollup-plugin-memory';

export default {
	exports: 'default',
	plugins: [
		memory({
			path: 'src/index',
			contents: "export { default } from './index';"
		}),
		babel({
			babelrc: false,
			presets: ['es2015-rollup', 'stage-0', 'react'],
			exclude: 'node_modules/**'
		})
	]
};
