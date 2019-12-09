import { h, Component } from 'preact';
import { subscribers, getCurrentUrl, Link as StaticLink, exec, segmentize } from 'preact-router';

export class Match extends Component {
	
	constructor(props, context) {
		super(props);
		this.baseUrl = props.basePath || '';
		if (props.path) {
			let segments = segmentize(props.path);
			segments.forEach(segment => {
				if (segment.indexOf(':') == -1) {
					this.baseUrl = this.baseUrl + '/' + segment;
				}
			});
		}
		if (context && context['preact-router-base']) {
			this.baseUrl = context['preact-router-base'] + this.baseUrl;
		}
	}
	update = url => {
		this.nextUrl = url;
		this.setState({});
	};
	componentDidMount() {
		subscribers.push(this.update);
	}
	componentWillUnmount() {
		subscribers.splice(subscribers.indexOf(this.update)>>>0, 1);
	}

	getChildContext() {
		return {['preact-router-base']: this.baseUrl};
	}


	render(props ) {
		let url = this.nextUrl || getCurrentUrl(),
			path = url.replace(/\?.+$/,'');
		this.nextUrl = null;
		return props.children({
			url,
			path,
			matches: exec(path, props.path, {}) !== false
		});
	}
}

export const Link = ({ activeClassName, path, ...props }) => (
	<Match path={path || props.href}>
		{ ({ matches }) => (
			<StaticLink {...props} class={[props.class || props.className, matches && activeClassName].filter(Boolean).join(' ')} />
		) }
	</Match>
);

export default Match;
Match.Link = Link;
