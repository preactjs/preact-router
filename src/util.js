
const EMPTY = {};

export function exec(url, route, opts=EMPTY) {
	let reg = /^([^?]*)(?:\?([^#]*))?(#.*)?$/,
		[, pathname, searcn] = (url.match(reg) || []),
		matches = {},
		ret;
	if (searcn) {
		searcn.split('&').forEach(parameter => {
			let [name, ...value] = parameter.split('=');
			matches[decodeURIComponent(name)] = decodeURIComponent(value.join('='));
		});
	}
	url = segmentize(pathname);
	route = segmentize(route || '');
	let max = Math.max(url.length, route.length);
	for (let i=0; i<max; i++) {
		if (route[i] && route[i].charAt(0)===':') {
			let [, param, flags] = /^:(.*?)([+*?]*)$/.exec(route[i]),
				plus = ~flags.indexOf('+'),
				star = ~flags.indexOf('*'),
				val = url[i] || '';
			if (!val && !star && (flags.indexOf('?')<0 || plus)) {
				ret = false;
				break;
			}
			else if (plus || star) {
				matches[param] = decodeURIComponent(url.slice(i).join('/'));
				break;
			}
			matches[param] = decodeURIComponent(val);
		}
		else if (route[i]!==url[i]) {
			ret = false;
			break;
		}
	}
	if (opts.default!==true && ret===false) return false;
	return matches;
}

export function pathRankSort(a, b) {
	let aAttr = a.attributes || EMPTY,
		bAttr = b.attributes || EMPTY;
	if (aAttr.default) return 1;
	if (bAttr.default) return -1;
	let diff = rank(aAttr.path) - rank(bAttr.path);
	return diff || (aAttr.path.length - bAttr.path.length);
}

export function segmentize(url) {
	return strip(url).split('/');
}

export function rank(url) {
	return (strip(url).match(/\/+/g) || '').length;
}

export function strip(url) {
	return url.replace(/(^\/+|\/+$)/g, '');
}
