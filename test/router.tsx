import { h, Component, FunctionalComponent } from 'preact';
import Router, { Link, Route, useRouter } from '../';

class ClassComponent extends Component<{}, {}> {
	render() {
		return <div></div>;
	}
}

const SomeFunctionalComponent: FunctionalComponent<{}> = ({}) => {
	return <div></div>;
};

function LinkComponent({}: {}) {
	return (
		<div>
			<Link href="/a" />
			<Link class="link" href="/b">
				This is some text
			</Link>
		</div>
	);
}

function RouterWithComponents() {
	return (
		<Router>
			<div default></div>
			<ClassComponent default />
			<SomeFunctionalComponent default />
			<div path="/a"></div>
			<ClassComponent path="/b" />
			<SomeFunctionalComponent path="/c" />
		</Router>
	);
}

function RouterWithRoutes() {
	return (
		<Router>
			<Route default component={ClassComponent} />
			<Route default component={SomeFunctionalComponent} />
			<Route path="/a" component={ClassComponent} />
			<Route path="/b" component={SomeFunctionalComponent} />
		</Router>
	);
}

function UseRouterFn() {
	const [{ active, current, matches, path, router, url, previous }, route] =
		useRouter();

	const [{ matches: typedMatches }] = useRouter<{ id: string }>();
	const id = typedMatches.id;

	route('/foo');
	route({ url: '/bar', replace: true });
}
