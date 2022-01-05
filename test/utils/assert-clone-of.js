import { cloneElement, toChildArray } from 'preact';

export function toBeCloneOf(util) {
	return {
		compare(actual, expected, opts) {
			const { matches = {}, url = expected.props.path } = opts || {};
			const clonedRoute = cloneElement(expected, { url, matches, ...matches });
			const result = {};
			result.pass = util.equals(cleanVNode(actual), cleanVNode(clonedRoute));
			result.message = `Expected ${serialize(actual)} ${
				result.pass ? ' not' : ''
			}to equal ${serialize(clonedRoute)}`;
			return result;
		}
	};
}

function cleanVNode(vnode) {
	const clone = Object.assign({}, vnode);
	delete clone.id;
	delete clone.constructor;
	delete clone.__v;
	return clone;
}

function serialize(vnode, prefix = '') {
	const type = typeof vnode.type === 'function' ? vnode.type.name : vnode.type;
	let str = `${prefix}<${type}`;
	let children;
	for (let prop in vnode.props) {
		const v = vnode.props[prop];
		if (prop === 'children') {
			children = toChildArray(v).reduce(
				(str, v) => `${str}\n${serialize(v, `${prefix}  `)}`,
				''
			);
		} else {
			str += ` ${prop}=${JSON.stringify(v)}`;
		}
	}
	if (children) {
		str += `${children}\n${prefix}</${type}>`;
	} else {
		str += ' />';
	}
	return str;
}
