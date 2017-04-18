import { h, Component } from 'preact';
import { subscribers, getCurrentUrl, Link as StaticLink } from 'preact-router';
import { segmentize, CONTEXT_KEY } from './util';

export class Match extends Component {
	constructor(props, context) {
		super(props);
		this.baseUrl = this.props.base || '';
		if (props.path) {
			let segments = segmentize(props.path);
			segments.forEach(segment => {
				if (segment.indexOf(':') == -1) {
					this.baseUrl = this.baseUrl + '/' + segment;
				}
			});
		}
		if (context && context[CONTEXT_KEY]) {
			this.baseUrl = context[CONTEXT_KEY] + this.baseUrl;
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
		let result = {[CONTEXT_KEY]: this.baseUrl};
		return result;
	}
	render(props) {
		let url = this.nextUrl || getCurrentUrl(),
			path = url.replace(/\?.+$/,'');
		this.nextUrl = null;
		console.log('children', props.children);
		return props.children[0] && props.children[0]({
			url,
			path,
			matches: path===props.path
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
