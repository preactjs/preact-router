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

export interface RouterOnChangeArgs {
    router: Router;
    url: string;
    previous?: string;
    active: preact.VNode[];
    current: preact.VNode;
}

export interface RouterProps extends RoutableProps {
    history?: CustomHistory;
    static?: boolean;
    url?: string;
    onChange?: (args: RouterOnChangeArgs) => void;
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

export const subscribers: Array<(url: string) => void>

type AnyComponent<Props> =
  | preact.FunctionalComponent<Props>
  | preact.ComponentConstructor<Props, any>;

export interface RouteProps<Props> extends RoutableProps {
    component: AnyComponent<Props>;
}

export function Route<Props>(
    props: RouteProps<Props> & Partial<Props>
): preact.VNode;

export function Link(props: {activeClassName?: string} & preact.JSX.HTMLAttributes): preact.VNode;

declare module 'preact' {
    export interface Attributes extends RoutableProps {}
}

export default Router;
