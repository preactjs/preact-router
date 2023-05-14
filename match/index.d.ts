import * as preact from 'preact';

import { Link as StaticLink, RoutableProps } from '..';

export class Match extends preact.Component<RoutableProps, {}> {
	render(): preact.VNode;
}

export interface LinkProps extends preact.JSX.HTMLAttributes<HTMLAnchorElement> {
	activeClassName?: string;
	children?: preact.ComponentChildren;
}

export function Link(props: LinkProps): preact.VNode;

export default Match;
