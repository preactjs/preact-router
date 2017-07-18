import {Component, FunctionalComponent, ComponentProps} from 'preact';

declare module 'preact' {
    export interface ComponentProps<C extends Component<any, any> | FunctionalComponent<any>> {
        path?: string;
        default?: boolean;
    }

    export interface PreactHTMLAttributes {
        path?: string;
        default?: boolean;
    }
}
