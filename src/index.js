import { h, Component } from 'preact';
import { exec, pathRankSort } from './util';

const routers = [];

const EMPTY = {};

function route(url, replace=false) {
	if (typeof url!=='string' && url.url) {
		replace = url.replace;
		url = url.url;
	}
	if (history) {
		if (replace===true) {
			history.replaceState(null, null, url);
		}
		else {
			history.pushState(null, null, url);
		}
	}
	routeTo(url);
}

function routeTo(url) {
	routers.forEach( router => router.routeTo(url) );
}

function getCurrentUrl() {
	let url = typeof location!=='undefined' ? location : EMPTY;
	return `${url.pathname || ''}${url.search || ''}`;
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


const Link = ({ children, ...props }) => (
	<a {...props} onClick={ handleLinkClick }>{ children }</a>
);


class Router extends Component {
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


const Route = ({ component:RoutedComponent, url, matches }) => (
	<RoutedComponent {...{url, matches}} />
);


Router.route = route;
Router.Router = Router;
Router.Route = Route;
Router.Link = Link;

export default Router;
