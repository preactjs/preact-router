import fs from 'fs';
import buble from 'rollup-plugin-buble';
import memory from 'rollup-plugin-memory';
import uglify from 'rollup-plugin-uglify';
import es3 from 'rollup-plugin-es3';
import replace from 'rollup-plugin-post-replace';

let pkg = JSON.parse(fs.readFileSync('./package.json'));

let format = process.env.FORMAT;

export default {
	entry: 'src/index.js',
	moduleName: pkg.amdName,
	dest: format==='es' ? pkg.module : pkg.main,
	sourceMap: true,
	useStrict: false,
	format,
	external: ['preact'],
	globals: {
		preact: 'preact'
	},
	plugins: [
		format!=='es' && memory({
			path: 'src/index',
			contents: "export { default } from './index';"
		}),

		buble({
			jsx: 'h'
		}),

		// strip Object.freeze()
		es3(),

		// remove Babel helpers
		replace({
			'throw ': 'return; throw '
		}),

		format!=='es' && uglify({
			output: { comments: false },
			mangle: {
				topLevel: true
			},
			compress: {
				unsafe: true,
				dead_code: true,
				pure_getters: true,
				pure_funcs: [
					'_classCallCheck'
				]
			}
		})
	].filter(Boolean)
};
