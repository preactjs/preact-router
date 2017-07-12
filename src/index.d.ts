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

export interface RouterProps extends RoutableProps {
    history?: CustomHistory;
    static?: boolean;
    url?: string;
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

export function Link(props: JSX.HTMLAttributes): preact.VNode;

export default Router;
