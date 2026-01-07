import { Signal } from '@minejs/signals';
import { JSXElement } from '@minejsx/render';
export { JSXElement, MountedComponent, RenderOptions } from '@minejsx/render';

type ComponentFunction<P = any> = (props: P) => JSXElement | null;
interface JSXProps {
    children?: any;
    ref?: Signal<HTMLElement | null>;
    [key: string]: any;
}
declare global {
    namespace JSX {
        type Element = JSXElement;
        type IntrinsicElements = Record<string, any>;
        interface ElementChildrenAttribute {
            children: object;
        }
    }
}

/**
 * Creates a DOM element from JSX
 * This is called automatically by TypeScript when it sees JSX syntax
 */
declare function jsx(type: string | ComponentFunction, props: JSXProps | null): JSXElement | null;
/**
 * Same as jsx() but for elements with multiple children
 * (Used by TypeScript JSX transform)
 */
declare const jsxs: typeof jsx;
/**
 * Fragment component (like React.Fragment)
 */
declare function Fragment(props: {
    children?: any;
}): DocumentFragment;
/**
 * Create a component from a function
 * Provides a cleaner API than raw JSX
 */
declare function component<P = any>(fn: (props: P) => JSXElement | null): ComponentFunction<P>;
/**
 * Create a component with setup function
 * Similar to Vue's Composition API
 */
declare function defineComponent<P = any>(setup: (props: P) => () => JSXElement | null): ComponentFunction<P>;
/**
 * Create multiple elements at once
 */
declare function createElements(elements: any[]): DocumentFragment;
/**
 * Show/hide element based on condition
 */
declare function Show(props: {
    when: boolean | Signal<boolean>;
    children: any;
}): JSXElement | null;
/**
 * Render different elements based on condition
 */
declare function Switch(props: {
    children: {
        when: boolean | Signal<boolean>;
        children: any;
    }[];
}): JSXElement | null;
/**
 * Iterate over array and render elements
 */
declare function For<T>(props: {
    each: T[] | Signal<T[]>;
    children: (item: T, index: number) => JSXElement;
}): JSXElement;
declare const _default: {
    jsx: typeof jsx;
    jsxs: typeof jsx;
    Fragment: typeof Fragment;
    component: typeof component;
    defineComponent: typeof defineComponent;
    Show: typeof Show;
    Switch: typeof Switch;
    For: typeof For;
    createElements: typeof createElements;
};

export { type ComponentFunction, For, Fragment, type JSXProps, Show, Switch, component, createElements, _default as default, defineComponent, jsx, jsxs };
