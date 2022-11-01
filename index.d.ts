import * as preact from 'preact';

export function route(url: string, replace?: boolean): boolean;
export function route(options: { url: string; replace?: boolean }): boolean;

export function getCurrentUrl(): string;

export interface Location {
	pathname: string;
	search: string;
}

export interface CustomHistory {
	listen(callback: (location: Location) => void): () => void;
	location: Location;
	push(path: string): void;
	replace(path: string): void;
}

export interface RoutableProps {
	path?: string;
	default?: boolean;
}

type DefaultParams = Record<string, string | undefined> | null;

export interface RouterOnChangeArgs<
	RouteParams extends DefaultParams = DefaultParams
> {
	router: Router;
	url: string;
	previous?: string;
	active: preact.VNode[];
	current: preact.VNode;
	path: string | null;
	matches: RouteParams;
}

export interface RouterProps<RouteParams extends DefaultParams = DefaultParams>
	extends RoutableProps {
	history?: CustomHistory;
	static?: boolean;
	url?: string;
	onChange?: (args: RouterOnChangeArgs<RouteParams>) => void;
}

export class Router extends preact.Component<RouterProps, {}> {
	canRoute(url: string): boolean;
	getMatchingChildren(
		children: preact.VNode[],
		url: string,
		invoke: boolean
	): preact.VNode[];
	routeTo(url: string): boolean;
	render(props: RouterProps, {}): preact.VNode;
}

type AnyComponent<Props> =
	| preact.FunctionalComponent<Props>
	| preact.ComponentConstructor<Props, any>;

export interface RouteProps<Props> extends RoutableProps {
	component: AnyComponent<Props>;
}

export function Route<Props>(
	props: RouteProps<Props> & Partial<Props>
): preact.VNode;

export interface LinkProps
	extends Omit<preact.JSX.HTMLAttributes<HTMLAnchorElement>, 'onClick'> {}

export function Link(props: LinkProps): preact.VNode;

export function useRouter<
	RouteParams extends DefaultParams = DefaultParams
>(): [RouterOnChangeArgs<RouteParams>, typeof route];

declare module 'preact' {
	export interface Attributes extends RoutableProps {}
}

export default Router;
