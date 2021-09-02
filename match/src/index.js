import { h } from 'preact';
import { Link as StaticLink, exec, useRouter } from 'preact-router';

export function Match(props) {
	const [{ url, path }] = useRouter();
	return props.children({
		url,
		path,
		matches: !!url && !!path && exec(path, props.path, {}) !== false
	});
}

export function Link({ class: c, className, activeClass, activeClassName, path: linkPath, ...props }) {
	const inactive = [c, className].filter(Boolean).join(' ');
	const active = [c, className, activeClass, activeClassName].filter(Boolean).join(' ');
	const path = useRouter()[0].path || props.href;
	const matches = !!path && exec(path, linkPath, {}) !== false;

	return <StaticLink {...props} class={matches ? active : inactive} />
}

export default Match;
