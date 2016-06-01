import { h, Component } from 'preact';
import { exec, pathRankSort } from './util';

const ROUTERS = [];

const EMPTY = {};


function route(url, replace=false) {
	if (typeof url!=='string' && url.url) {
		replace = url.replace;
		url = url.url;
	}
	if (typeof history!=='undefined' && history.pushState) {
		if (replace===true) {
			history.replaceState(null, null, url);
		}
		else {
			history.pushState(null, null, url);
		}
	}
	return routeTo(url);
}


function routeTo(url) {
	let didRoute = false;
	ROUTERS.forEach( router => {
		if (router.routeTo(url)===true) {
			didRoute = true;
		}
	});
	return didRoute;
}


function getCurrentUrl() {
	let url = typeof location!=='undefined' ? location : EMPTY;
	return `${url.pathname || ''}${url.search || ''}`;
}


function handleLinkClick(e, target) {
	target = target || (e && (e.currentTarget || e.target)) || this;
	if (!target) return;
	if (route(target.getAttribute('href'))===true) {
		if (e.stopImmediatePropagation) e.stopImmediatePropagation();
		e.stopPropagation();
		e.preventDefault();
		return false;
	}
}


function linkHandler(e) {
	let t = e.target;
	do {
		let href = String(t.nodeName).toUpperCase()==='A' && t.getAttribute('href');
		if (href && href.match(/^\//g)) {
			return handleLinkClick(e, t);
		}
	} while ((t=t.parentNode));
}


if (typeof addEventListener==='function') {
	addEventListener('popstate', () => routeTo(getCurrentUrl()));
	addEventListener('click', delegateLinkHandler);
}


const Link = ({ children, ...props }) => (
	<a {...props} onClick={handleLinkClick}>{ children }</a>
);


class Router extends Component {
	state = {
		url: this.props.url || getCurrentUrl()
	};

	routeTo(url) {
		this._didRoute = false;
		this.setState({ url });
		this.forceUpdate();
		return this._didRoute;
	}

	componentWillMount() {
		ROUTERS.push(this);
	}

	componentWillUnmount() {
		ROUTERS.splice(ROUTERS.indexOf(this), 1);
	}

	render({ children, onChange }, { url }) {
		let active = children.slice().sort(pathRankSort).filter( ({ attributes }) => {
			let path = attributes.path,
				matches = exec(url, path, attributes);
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


const Route = ({ component:RoutedComponent, url, matches }) => (
	<RoutedComponent {...{url, matches}} />
);


Router.route = route;
Router.Router = Router;
Router.Route = Route;
Router.Link = Link;

export { route, Router, Route, Link };
export default Router;
