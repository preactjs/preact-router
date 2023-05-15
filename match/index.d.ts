import * as preact from 'preact';

import { RoutableProps } from '..';

type MatchInfo = {
	url: string;
	path: string;
	matches: Record<string, string>;
};

type MatchProps = RoutableProps & {
	children: (info: MatchInfo) => preact.VNode;
};

export class Match extends preact.Component<MatchProps, {}> {
	render(): preact.VNode;
}

export interface LinkProps extends preact.JSX.HTMLAttributes<HTMLAnchorElement> {
	activeClassName?: string;
	children?: preact.ComponentChildren;
}

export function Link(props: LinkProps): preact.VNode;

export default Match;
