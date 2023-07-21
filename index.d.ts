import * as preact from 'preact';

export function route(url: string, replace?: boolean): boolean;
export function route(options: { url: string; replace?: boolean }): boolean;

export function exec(url: string, route: string, opts: { default?: boolean }): false | Record<string, string | undefined>;

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
	default?: boolean | preact.JSX.SignalLike<boolean | undefined>;
}

export interface RouterOnChangeArgs<
	RouteParams extends Record<string, string | undefined> | null = Record<
		string,
		string | undefined
	> | null
> {
	router: Router;
	url: string;
	previous?: string;
	active: preact.VNode[];
	current: preact.VNode;
	path: string | null;
	matches: RouteParams;
}

export interface RouterProps<
	RouteParams extends Record<string, string | undefined> | null = Record<
		string,
		string | undefined
	> | null
> extends RoutableProps {
	history?: CustomHistory;
	static?: boolean;
	url?: string;
	onChange?: (args: RouterOnChangeArgs<RouteParams>) => void;
}

export class Router extends preact.Component<RouterProps, {}> {
	canRoute(url: string): boolean;
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

export function Link(
	props: preact.JSX.HTMLAttributes<HTMLAnchorElement>
): preact.VNode;

export function useRouter<
	RouteParams extends Record<string, string | undefined> | null = Record<
		string,
		string | undefined
	> | null
>(): [
	RouterOnChangeArgs<RouteParams>,
	(
		urlOrOptions: string | { url: string; replace?: boolean },
		replace?: boolean
	) => boolean
];

declare module 'preact' {
	export interface Attributes extends RoutableProps {}
}

export default Router;
