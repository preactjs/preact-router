import { h } from 'preact';
import { Link as StaticLink, exec, useRouter } from 'preact-router';

export function Match(props) {
	const router = useRouter()[0];
	return props.children({
		url: router.url,
		path: router.path,
		matches: exec(router.path || router.url, props.path, {}) !== false
	});
}

export function Link({
	className,
	activeClass,
	activeClassName,
	path,
	...props
}) {
	const router = useRouter()[0];
	const matches =
		(path && router.path && exec(router.path, path, {})) ||
		exec(router.url, props.href, {});

	let inactive = props.class || className || '';
	let active = (matches && (activeClass || activeClassName)) || '';
	props.class = inactive + (inactive && active && ' ') + active;

	return <StaticLink {...props} />;
}

export default Match;
