import { h } from 'preact';
import { Match, Link } from '../match';

function ChildComponent({}: {}) {
	return <div></div>;
}

function LinkComponent({}: {}) {
	return (
		<div>
			<Link href="/a" />
			<Link activeClassName="active" href="/b" />
			<Link activeClass="active" href="/c">
				This is some text
			</Link>
			<Link path="d" />
		</div>
	);
}

function MatchComponent({}: {}) {
	return (
		<Match path="/b">
			{({ matches, path, url }) => matches && <ChildComponent />}
		</Match>
	);
}
