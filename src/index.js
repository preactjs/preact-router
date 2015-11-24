import { h, Component } from 'preact';

const routers = [];

export function route(url) {
	if (history) {
		history.pushState(null, null, url);
	}
	routeTo(url);
}

function routeTo(url) {
	routers.forEach( router => router.routeTo(url) );
}

function getCurrentUrl() {
	return `${location.pathname || ''}${location.search || ''}`;
}

if (typeof addEventListener==='function') {
	addEventListener('popstate', () => routeTo(getCurrentUrl()));
}


function handleLinkClick(e) {
	route(this.getAttribute('href'));
	if (e.stopImmediatePropagation) e.stopImmediatePropagation();
	e.stopPropagation();
	e.preventDefault();
	return false;
}


export const Link = ({ children, ...props }) => (
	<a {...props} onClick={ handleLinkClick }>{ children }</a>
);


export class Router extends Component {
	getInitialState() {
		return { url: getCurrentUrl() };
	}

	routeTo(url) {
		this.setState({ url });
	}

	componentWillMount() {
		routers.push(this);
	}

	componentWillUnmount() {
		routers.splice(routers.indexOf(this), 1);
	}

	render({ children, onChange }, { url }) {
		let active = children.filter( ({ attributes }) => {
			let path = attributes.path,
				matches = exec(url, path);
			if (matches) {
				attributes.url = url;
				attributes.matches = matches;
				// copy matches onto props
				for (let i in matches) {
					if (matches.hasOwnProperty(i)) {
						attributes[i] = matches[i];
					}
				}
				return true;
			}
		});
		let previous = this.previousUrl;
		if (url!==previous) {
			this.previousUrl = url;
			if (typeof onChange==='function') {
				onChange({
					router: this,
					url,
					previous,
					active,
					current: active[0]
				});
			}
		}
		return active[0] || null;
	}
}


export const Route = ({ component:RoutedComponent, url, matches }) => (
	<RoutedComponent {...{url, matches}} />
);

/*
export class Route extends Component {
	render({ component:RoutedComponent, url, matches }) {
		return <RoutedComponent { ...{url, matches} } />;
	}
}
*/


function exec(url, route) {
	let reg = /(?:\?([^#]*))?(#.*)?$/,
		c = url.match(reg),
		matches = {};
	if (c && c[1]) {
		let p = c[1].split('&');
		for (let i=0; i<p.length; i++) {
			let r = p[i].split('=');
			matches[decodeURIComponent(r[0])] = decodeURIComponent(r.slice(1).join('='));
		}
	}
	url = segmentize(url.replace(reg, ''));
	route = segmentize(route);
	let max = Math.max(url.length, route.length);
	for (let i=0; i<max; i++) {
		if (route[i] && route[i].charAt(0)===':') {
			matches[route[i].substring(1)] = decodeURIComponent(url[i] || '');
		}
		else {
			if (route[i]!==url[i]) {
				return false;
			}
		}
	}
	return matches;
}


Router.route = route;
Router.Route = Route;
Router.Link = Link;
export default Router;


let segmentize = url => strip(url).split('/');

let strip = url => url.replace(/(^\/+|\/+$)/g, '');
