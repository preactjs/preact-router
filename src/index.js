import {
	h,
	cloneElement,
	createElement,
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

function setUrl(url, type = 'push') {
	if (customHistory && customHistory[type]) {
		customHistory[type](url);
	} else if (typeof history !== 'undefined' && history[`${type}State`]) {
		history[`${type}State`](null, null, url);
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

function route(url, replace = false) {
	if (typeof url !== 'string' && url.url) {
		replace = url.replace;
		url = url.url;
	}

	// only push URL into history if we can handle it
	if (canRoute(url)) {
		setUrl(url, replace ? 'replace' : 'push');
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
		if (ROUTERS[i].routeTo(url) === true) {
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

function handleLinkClick(e) {
	if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button !== 0)
		return;
	routeFromLink(e.currentTarget || e.target || this);
	return prevent(e);
}

function prevent(e) {
	if (e) {
		if (e.stopImmediatePropagation) e.stopImmediatePropagation();
		if (e.stopPropagation) e.stopPropagation();
		e.preventDefault();
	}
	return false;
}

function delegateLinkHandler(e) {
	// ignore events the browser takes care of already:
	if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.button !== 0)
		return;

	let t = e.target;
	do {
		if (String(t.nodeName).toUpperCase() === 'A' && t.getAttribute('href')) {
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

	if (typeof addEventListener === 'function') {
		if (!customHistory) {
			addEventListener('popstate', () => {
				routeTo(getCurrentUrl());
			});
		}
		addEventListener('click', delegateLinkHandler);
	}
	eventListenersInitialized = true;
}

class Router extends Component {
	constructor(props) {
		super(props);
		if (props.history) {
			customHistory = props.history;
		}

		this.state = {
			url: props.url || getCurrentUrl()
		};
		this.contextValue = {};

		initEventListeners();
	}

	shouldComponentUpdate(props) {
		if (props.static !== true) return true;
		return (
			props.url !== this.props.url || props.onChange !== this.props.onChange
		);
	}

	/** Check if the given URL can be matched against any children */
	canRoute(url) {
		const children = toChildArray(this.props.children);
		return this.getMatchingChildren(children, url, false).length > 0;
	}

	/** Re-render children with a new URL to match against. */
	routeTo(url) {
		this.setState({ url });

		const didRoute = this.canRoute(url);

		// trigger a manual re-route if we're not in the middle of an update:
		if (!this.updating) this.forceUpdate();

		return didRoute;
	}

	componentWillMount() {
		this.updating = true;
	}

	componentDidMount() {
		ROUTERS.push(this);
		if (customHistory) {
			this.unlisten = customHistory.listen(action => {
				let location = action.location || action;
				this.routeTo(`${location.pathname || ''}${location.search || ''}`);
			});
		}
		this.updating = false;
	}

	componentWillUnmount() {
		if (typeof this.unlisten === 'function') this.unlisten();
		ROUTERS.splice(ROUTERS.indexOf(this), 1);
	}

	componentWillUpdate() {
		this.updating = true;
	}

	componentDidUpdate() {
		this.updating = false;
	}

	getMatchingChildren(children, url, invoke) {
		return children
			.filter(prepareVNodeForRanking)
			.sort(pathRankSort)
			.map(vnode => {
				let matches = exec(url, vnode.props.path, vnode.props);
				if (matches) {
					if (invoke !== false) {
						let newProps = { url, matches };
						assign(newProps, matches);
						delete newProps.ref;
						delete newProps.key;
						return {
							vnode: cloneElement(vnode, newProps),
							matches
						};
					}

					return { vnode, matches };
				}
			})
			.filter(Boolean);
	}

	render({ children, onChange }, { url }) {
		let ctx = this._contextValue;

		let { vnode: current, matches } = active[0] || {
			vnode: null,
			matches: null
		};

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
}

const Link = props =>
	createElement('a', assign({ onClick: handleLinkClick }, props));

const Route = props => createElement(props.component, props);

export { getCurrentUrl, route, Router, Route, Link, exec, useRouter };
export default Router;
