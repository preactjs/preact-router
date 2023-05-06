import * as preact from 'preact';

import { LinkProps as StaticLinkProps, RoutableProps } from '..';

export class Match extends preact.Component<RoutableProps, {}> {
	render(): preact.VNode;
}

export interface LinkProps extends StaticLinkProps {
	activeClass?: string;
	activeClassName?: string;
	path?: string;
}

export function Link(props: LinkProps): preact.VNode;

export default Match;
