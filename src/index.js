import {
	h,
	cloneElement,
	Component,
	toChildArray,
	createContext
} from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import { exec, prepareVNodeForRanking, assign, pathRankSort } from './util';

const EMPTY = {};
const ROUTERS = [];
const SUBS = [];
let customHistory = null;

const GLOBAL_ROUTE_CONTEXT = {
	url: getCurrentUrl()
};

const RouterContext = createContext(GLOBAL_ROUTE_CONTEXT);

function useRouter() {
	const ctx = useContext(RouterContext);
	// Note: this condition can't change without a remount, so it's a safe conditional hook call
	if (ctx === GLOBAL_ROUTE_CONTEXT) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const update = useState()[1];
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			SUBS.push(update);
			return () => SUBS.splice(SUBS.indexOf(update), 1);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);
	}
	return [ctx, route];
}

function setUrl(url, type = 'push', state) {
	if (customHistory && customHistory[type]) {
		customHistory[type](url, state);
	} else if (typeof history !== 'undefined' && history[`${type}State`]) {
		history[`${type}State`](state, null, url);
	}
}

function getCurrentUrl() {
	let url;
	if (customHistory && customHistory.location) {
		url = customHistory.location;
	} else if (customHistory && customHistory.getCurrentLocation) {
		url = customHistory.getCurrentLocation();
	} else {
		url = typeof location !== 'undefined' ? location : EMPTY;
	}
	return `${url.pathname || ''}${url.search || ''}`;
}

function route(url, replace = false, state = null) {
	if (typeof url !== 'string' && url.url) {
		replace = url.replace;
		url = url.url;
	}

	// only push URL into history if we can handle it
	if (canRoute(url)) {
		setUrl(url, replace ? 'replace' : 'push', state);
	}

	return routeTo(url);
}

/** Check if the given URL can be handled by any router instances. */
function canRoute(url) {
	for (let i = ROUTERS.length; i--; ) {
		if (ROUTERS[i].canRoute(url)) return true;
	}
	return false;
}

/** Tell all router instances to handle the given URL.  */
function routeTo(url) {
	let didRoute = false;
	for (let i = 0; i < ROUTERS.length; i++) {
		if (ROUTERS[i].routeTo(url)) {
			didRoute = true;
		}
	}
	return didRoute;
}

function routeFromLink(node) {
	// only valid elements
	if (!node || !node.getAttribute) return;

	let href = node.getAttribute('href'),
		target = node.getAttribute('target');

	// ignore links with targets and non-path URLs
	if (!href || !href.match(/^\//g) || (target && !target.match(/^_?self$/i)))
		return;

	// attempt to route, if no match simply cede control to browser
	return route(href);
}

function prevent(e) {
	if (e.stopImmediatePropagation) e.stopImmediatePropagation();
	if (e.stopPropagation) e.stopPropagation();
	e.preventDefault();
	return false;
}

// Handles both delegated and direct-bound link clicks
function delegateLinkHandler(e) {
	// ignore events the browser takes care of already:
	if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button) return;

	let t = e.target;
	do {
		if (t.localName === 'a' && t.getAttribute('href')) {
			if (t.hasAttribute('data-native') || t.hasAttribute('native')) return;
			// if link is handled by the router, prevent browser defaults
			if (routeFromLink(t)) {
				return prevent(e);
			}
		}
	} while ((t = t.parentNode));
}

let eventListenersInitialized = false;

function initEventListeners() {
	if (eventListenersInitialized) return;
	eventListenersInitialized = true;

	if (!customHistory) {
		addEventListener('popstate', () => {
			routeTo(getCurrentUrl());
		});
	}
	addEventListener('click', delegateLinkHandler);
}

/**
 * @class
 * @this {import('preact').Component}
 */
function Router(props) {
	if (props.history) {
		customHistory = props.history;
	}

	this.state = {
		url: props.url || getCurrentUrl()
	};
}

// @ts-ignore-next-line
const RouterProto = (Router.prototype = new Component());

assign(RouterProto, {
	shouldComponentUpdate(props) {
		if (props.static !== true) return true;
		return (
			props.url !== this.props.url || props.onChange !== this.props.onChange
		);
	},

	/** Check if the given URL can be matched against any children */
	canRoute(url) {
		const children = toChildArray(this.props.children);
		return this._getMatchingChild(children, url) !== undefined;
	},

	/** Re-render children with a new URL to match against. */
	routeTo(url) {
		this.setState({ url });

		const didRoute = this.canRoute(url);

		// trigger a manual re-route if we're not in the middle of an update:
		if (!this._updating) this.forceUpdate();

		return didRoute;
	},

	componentWillMount() {
		this._updating = true;
	},

	componentDidMount() {
		initEventListeners();
		ROUTERS.push(this);
		if (customHistory) {
			this._unlisten = customHistory.listen(action => {
				let location = action.location || action;
				this.routeTo(`${location.pathname || ''}${location.search || ''}`);
			});
		}
		this._updating = false;
	},

	componentWillUnmount() {
		if (typeof this._unlisten === 'function') this._unlisten();
		ROUTERS.splice(ROUTERS.indexOf(this), 1);
	},

	componentWillUpdate() {
		this._updating = true;
	},

	componentDidUpdate() {
		this._updating = false;
	},

	_getMatchingChild(children, url) {
		children = children.filter(prepareVNodeForRanking).sort(pathRankSort);
		for (let i = 0; i < children.length; i++) {
			let vnode = children[i];
			let matches = exec(url, vnode.props.path, vnode.props);
			if (matches) return [vnode, matches];
		}
	},

	render({ children, onChange }, { url }) {
		let ctx = this._contextValue;

		let active = this._getMatchingChild(toChildArray(children), url);
		let matches, current;
		if (active) {
			matches = active[1];
			current = cloneElement(
				active[0],
				assign(assign({ url, matches }, matches), {
					key: undefined,
					ref: undefined
				})
			);
		}

		if (url !== (ctx && ctx.url)) {
			let newCtx = {
				url,
				previous: ctx && ctx.url,
				current,
				path: current ? current.props.path : null,
				matches
			};

			// only copy simple properties to the global context:
			assign(GLOBAL_ROUTE_CONTEXT, (ctx = this._contextValue = newCtx));

			// these are only available within the subtree of a Router:
			ctx.router = this;
			ctx.active = current ? [current] : [];

			// notify useRouter subscribers outside this subtree:
			for (let i = SUBS.length; i--; ) SUBS[i]({});

			if (typeof onChange === 'function') {
				onChange(ctx);
			}
		}

		return (
			<RouterContext.Provider value={ctx}>{current}</RouterContext.Provider>
		);
	}
});

const Link = props => h('a', assign({ onClick: delegateLinkHandler }, props));

const Route = props => h(props.component, props);

export { getCurrentUrl, route, Router, Route, Link, exec, useRouter };
export default Router;
