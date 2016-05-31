
const EMPTY = {};

export function exec(url, route, opts=EMPTY) {
	let reg = /(?:\?([^#]*))?(#.*)?$/,
		c = url.match(reg),
		matches = {},
		ret;
	if (c && c[1]) {
		let p = c[1].split('&');
		for (let i=0; i<p.length; i++) {
			let r = p[i].split('=');
			matches[decodeURIComponent(r[0])] = decodeURIComponent(r.slice(1).join('='));
		}
	}
	url = segmentize(url.replace(reg, ''));
	route = segmentize(route || '');
	let max = Math.max(url.length, route.length);
	for (let i=0; i<max; i++) {
		if (route[i] && route[i].charAt(0)===':') {
			let param = route[i].replace(/(^\:|[+*?]+$)/g, ''),
				flags = (route[i].match(/[+*?]+$/) || EMPTY)[0] || '',
				plus = ~flags.indexOf('+'),
				star = ~flags.indexOf('*'),
				val = url[i] || '';
			if (!val && !star && (flags.indexOf('?')<0 || plus)) {
				ret = false;
				break;
			}
			matches[param] = decodeURIComponent(val);
			if (plus || star) {
				matches[param] = url.slice(i).map(decodeURIComponent).join('/');
				break;
			}
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
