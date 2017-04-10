import fs from 'fs';
import babel from 'rollup-plugin-babel';
import memory from 'rollup-plugin-memory';

let pkg = JSON.parse(fs.readFileSync('./package.json'));

let babelRc = JSON.parse(fs.readFileSync('.babelrc','utf8')); // eslint-disable-line

let format = process.env.FORMAT;

export default {
	entry: 'src/index.js',
	moduleName: pkg.amdName,
	dest: format==='es' ? pkg.module : pkg.main,
	sourceMap: true,
	format,
	external: ['preact'],
	globals: {
		preact: 'preact'
	},
	plugins: [
		memory({
			path: 'src/index',
			contents: "export { default } from './index';"
		}),
		babel({
			babelrc: false,
			presets: [
				['es2015', { loose:true, modules:false }]
			].concat(babelRc.presets.slice(1)),
			plugins: babelRc.plugins,
			exclude: 'node_modules/**'
		})
	]
};
