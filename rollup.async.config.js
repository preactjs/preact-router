import fs from 'fs';
import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-minify';

var babelRc = JSON.parse(fs.readFileSync('.babelrc','utf8')); // eslint-disable-line
export default {
	entry: 'src/AsyncRoute.js',
	format: 'umd',
	sourceMap: true,
	moduleName: 'async',
	dest: 'async/index.js',
	plugins: [
		babel({
			babelrc: false,
			presets: [
				['es2015', { loose:true, modules:false }]
			].concat(babelRc.presets.slice(1)),
			plugins: babelRc.plugins,
			exclude: 'node_modules/**'
		}),
		minify({umd: 'async/index.min.js'})
	]
};
