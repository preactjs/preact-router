export function route(url: string, replace?: boolean): boolean;

export interface CustomHistory {
    getCurrentLocation?: () => string;
    location?: string;
    listen(callback: (url: string) => void): () => void;
    push?: (url: string) => void;
    replace?: (url: string) => void;
}

export interface RouterProps extends JSX.HTMLAttributes, preact.ComponentProps {
    history?: CustomHistory;
    path?: string;
    static?: boolean;
    url?: string;
}

export class Router extends preact.Component<RouterProps, {}> {
    canRoute(url: string): boolean;
    getMatchingChildren(children: preact.VNode[], url: string, invoke: boolean): preact.VNode[];
    routeTo(url: string): boolean;
    render(props: RouterProps, {}): preact.VNode;
}

export interface RouteArgs<PropsType, StateType> {
    component: preact.Component<PropsType, StateType>;
    path: string;
    matches?: boolean;
    url?: string;
}

export function Route<PropsType, StateType>({component, url, matches}: RouteArgs<PropsType, StateType>): preact.VNode;

export function Link(props: any): preact.VNode;

export namespace Router {
    var route: ((url: string, replace?: boolean) => boolean);
    var Route: (({component, url, matches}) => preact.VNode);
    var Link: ((props: any) => preact.VNode);
}

export default Router;
