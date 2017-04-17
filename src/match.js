import { h, Component } from 'preact';
import { subscribers, getCurrentUrl, Link as StaticLink } from 'preact-router';

export class Match extends Component {
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
	render(props) {
		let url = this.nextUrl || getCurrentUrl(),
			path = url.replace(/\?.+$/,'');
		this.nextUrl = null;
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
