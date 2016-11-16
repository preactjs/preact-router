import { h, Component } from 'preact';
import { exec, pathRankSort } from './util';

let customHistory = null;

const ROUTERS = [];

const EMPTY = {};

// hangs off all elements created by preact
const ATTR_KEY = typeof Symbol!=='undefined' ? Symbol.for('preactattr') : '__preactattr_';


function isPreactElement(node) {
	return ATTR_KEY in node;
}

function setUrl(url, type='push') {
	if (customHistory && customHistory[type]) {
		customHistory[type](url);
	}
	else if (typeof history!=='undefined' && history[type+'State']) {
		history[type+'State'](null, null, url);
	}
}


function getCurrentUrl() {
	let url;
	if (customHistory && customHistory.location) {
		url = customHistory.location;
	}
	else if (customHistory && customHistory.getCurrentLocation) {
		url = customHistory.getCurrentLocation();
	}
	else {
		url = typeof location!=='undefined' ? location : EMPTY;
	}
	return `${url.pathname || ''}${url.search || ''}`;
}


function route(url, replace=false) {
	if (typeof url!=='string' && url.url) {
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
	for (let i=ROUTERS.length; i--; ) {
		if (ROUTERS[i].canRoute(url)) return true;
	}
	return false;
}


/** Tell all router instances to handle the given URL.  */
function routeTo(url) {
	let didRoute = false;
	for (let i=0; i<ROUTERS.length; i++) {
		if (ROUTERS[i].routeTo(url)===true) {
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
	if (!href || !href.match(/^\//g) || (target && !target.match(/^_?self$/i))) return;

	// attempt to route, if no match simply cede control to browser
	return route(href);
}


function handleLinkClick(e) {
	if (e.button !== 0) return;
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
	if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

	let t = e.target;
	do {
		if (String(t.nodeName).toUpperCase()==='A' && t.getAttribute('href') && isPreactElement(t)) {
			if (e.button !== 0) return;
			// if link is handled by the router, prevent browser defaults
			if (routeFromLink(t)) {
				return prevent(e);
			}
		}
	} while ((t=t.parentNode));
}


if (typeof addEventListener==='function') {
	addEventListener('popstate', () => routeTo(getCurrentUrl()));
	addEventListener('click', delegateLinkHandler);
}


const Link = (props) => {
	return h('a', Object.assign({}, props, { onClick: handleLinkClick }));
};


class Router extends Component {
	constructor(props) {
		super(props);
		if (props.history) {
			customHistory = props.history;
		}

		this.state = {
			url: this.props.url || getCurrentUrl()
		};
	}

	shouldComponentUpdate(props) {
		if (props.static!==true) return true;
		return props.url!==this.props.url || props.onChange!==this.props.onChange;
	}

	/** Check if the given URL can be matched against any children */
	canRoute(url) {
		return this.getMatchingChildren(this.props.children, url, false).length > 0;
	}

	/** Re-render children with a new URL to match against. */
	routeTo(url) {
		this._didRoute = false;
		this.setState({ url });

		// if we're in the middle of an update, don't synchronously re-route.
		if (this.updating) return this.canRoute(url);

		this.forceUpdate();
		return this._didRoute;
	}

	componentWillMount() {
		ROUTERS.push(this);
		this.updating = true;
	}

	componentDidMount() {
		this.updating = false;
	}

	componentWillUnmount() {
		ROUTERS.splice(ROUTERS.indexOf(this), 1);
	}

	componentWillUpdate() {
		this.updating = true;
	}

	componentDidUpdate() {
		this.updating = false;
	}

	getMatchingChildren(children, url, invoke) {
		return children.slice().sort(pathRankSort).filter( ({ attributes }) => {
			let path = attributes.path,
				matches = exec(url, path, attributes);
			if (matches) {
				if (invoke!==false) {
					attributes.url = url;
					attributes.matches = matches;
					// copy matches onto props
					for (let i in matches) {
						if (matches.hasOwnProperty(i)) {
							attributes[i] = matches[i];
						}
					}
				}
				return true;
			}
		});
	}

	render({ children, onChange }, { url }) {
		let active = this.getMatchingChildren(children, url, true);

		let current = active[0] || null;
		this._didRoute = !!current;

		let previous = this.previousUrl;
		if (url!==previous) {
			this.previousUrl = url;
			if (typeof onChange==='function') {
				onChange({
					router: this,
					url,
					previous,
					active,
					current
				});
			}
		}

		return current;
	}
}


const Route = ({ component, url, matches }) => {
	return h(component, { url, matches });
};


Router.route = route;
Router.Router = Router;
Router.Route = Route;
Router.Link = Link;

export { route, Router, Route, Link };
export default Router;
