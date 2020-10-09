import { h, Component } from 'preact';
import { subscribers, getCurrentUrl, Link as StaticLink, exec } from 'preact-router';

export class Match extends Component {
	componentDidMount() {
		this.update = url => {
			this.nextUrl = url;
			this.setState({});
		};
		subscribers.push(this.update);
	}
	componentWillUnmount() {
		subscribers.splice(subscribers.indexOf(this.update)>>>0, 1);
	}
	render(props) {
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

export const Link = ({ class: c, className, activeClass, activeClassName, path, ...props }) => (
	<Match path={path || props.href}>
		{ ({ matches }) => (
			<StaticLink
				{...props}
				class={`${c || className || ''}${matches ? ' ' + (activeClass || activeClassName) : ''}`}
			/>
		) }
	</Match>
);

export default Match;
