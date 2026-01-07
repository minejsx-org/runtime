/* eslint-disable @typescript-eslint/no-explicit-any */
// src/mod/runtime.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { effect, isSignal, type Signal } from '@minejs/signals';
    import type { JSXElement, JSXProps, ComponentFunction } from './types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    /**
     * Creates a DOM element from JSX
     * This is called automatically by TypeScript when it sees JSX syntax
     */
    export function jsx(
        type: string | ComponentFunction,
        props: JSXProps | null
    ): JSXElement | null {
        // Handle component (function)
        if (typeof type === 'function') {
            return type(props || {});
        }

        // Handle HTML element (string)
        return createHTMLElement(type, props || {});
    }

    /**
     * Same as jsx() but for elements with multiple children
     * (Used by TypeScript JSX transform)
     */
    export const jsxs = jsx;

    /**
     * Fragment component (like React.Fragment)
     */
    export function Fragment(props: { children?: any }): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const children = normalizeChildren(props.children);

        children.forEach(child => {
            if (child instanceof Node) {
                fragment.appendChild(child);
            }
        });

        return fragment;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ ════ ════════════════════════════════════════╗

    // ============================================================================
    // HTML ELEMENT CREATION
    // ============================================================================

    function createHTMLElement(type: string, props: JSXProps): Element {
        const element = document.createElement(type);

        // Set properties and attributes
        for (const [key, value] of Object.entries(props)) {
            if (key === 'children') {
                // Handle children separately
                appendChildren(element, value);
            } else if (key === 'ref') {
                // Handle ref
                handleRef(element as HTMLElement, value);
            } else if (key.startsWith('on')) {
                // Handle events (onClick, onInput, etc)
                handleEvent(element, key, value);
            } else if (key === 'className' || key === 'class') {
                // Handle className/class
                handleClassName(element, value);
            } else if (key === 'style') {
                // Handle inline styles
                handleStyle(element as HTMLElement, value);
            } else if (isSignal(value)) {
                // Handle reactive props
                handleReactiveProp(element, key, value);
            } else if (typeof value === 'boolean') {
                // Handle boolean attributes (disabled, checked, etc)
                if (value) {
                    element.setAttribute(key, '');
                }
            } else if (value != null) {
                // Handle static props
                element.setAttribute(key, String(value));
            }
        }

        return element;
    }

    // ============================================================================
    // CHILDREN HANDLING
    // ============================================================================

    function appendChildren(parent: Element, children: any): void {
        const normalized = normalizeChildren(children);

        normalized.forEach(child => {
            if (child instanceof Node) {
                parent.appendChild(child);
            } else if (isSignal(child)) {
                // Reactive text node
                const textNode = document.createTextNode('');
                effect(() => {
                    textNode.textContent = String(child());
                });
                parent.appendChild(textNode);
            } else if (child != null && child !== false) {
                // Static text node
                parent.appendChild(document.createTextNode(String(child)));
            }
        });
    }

    function normalizeChildren(children: any): any[] {
        if (children == null || children === false) {
            return [];
        }

        if (Array.isArray(children)) {
            return children.flatMap(normalizeChildren);
        }

        return [children];
    }

    // ============================================================================
    // REF HANDLING
    // ============================================================================

    function handleRef(element: HTMLElement, ref: any): void {
        if (isSignal(ref)) {
            ref.set(element);
        } else if (typeof ref === 'function') {
            ref(element);
        }
    }

    // ============================================================================
    // EVENT HANDLING
    // ============================================================================

    function handleEvent(element: Element, eventName: string, handler: any): void {
        if (typeof handler !== 'function') return;

        // Convert onClick → click, onInput → input, etc
        const event = eventName.slice(2).toLowerCase();

        element.addEventListener(event, handler);
    }

    // ============================================================================
    // CLASS NAME HANDLING
    // ============================================================================

    function handleClassName(element: Element, value: any): void {
        if (isSignal(value)) {
            // Reactive className
            effect(() => {
                const className = value();
                if (className != null) {
                    element.className = String(className);
                }
            });
        } else if (value != null) {
            // Static className
            element.className = String(value);
        }
    }

    // ============================================================================
    // STYLE HANDLING
    // ============================================================================

    function handleStyle(element: HTMLElement, value: any): void {
        if (isSignal(value)) {
            // Reactive style object
            effect(() => {
                const styles = value();
                applyStyles(element, styles);
            });
        } else {
            // Static style
            applyStyles(element, value);
        }
    }

    function applyStyles(element: HTMLElement, styles: any): void {
        if (typeof styles === 'string') {
            element.style.cssText = styles;
        } else if (typeof styles === 'object' && styles != null) {
            Object.entries(styles).forEach(([key, value]) => {
                if (value != null) {
                    // Convert camelCase to kebab-case
                    const cssKey = key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
                    element.style.setProperty(cssKey, String(value));
                }
            });
        }
    }

    // ============================================================================
    // REACTIVE PROP HANDLING
    // ============================================================================

    function handleReactiveProp(element: Element, key: string, signal: Signal<any>): void {
        effect(() => {
            const value = signal();

            if (value != null) {
                if (key in element) {
                    // Set as property (for input.value, etc)
                    ; (element as any)[key] = value;
                } else {
                    // Set as attribute
                    element.setAttribute(key, String(value));
                }
            } else {
                element.removeAttribute(key);
            }
        });
    }

    /**
     * Create a component from a function
     * Provides a cleaner API than raw JSX
     */
    export function component<P = any>(
        fn: (props: P) => JSXElement | null
    ): ComponentFunction<P> {
        return fn;
    }

    /**
     * Create a component with setup function
     * Similar to Vue's Composition API
     */
    export function defineComponent<P = any>(
        setup: (props: P) => () => JSXElement | null
    ): ComponentFunction<P> {
        return (props: P) => {
            const render = setup(props);
            return render();
        };
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Create multiple elements at once
     */
    export function createElements(elements: any[]): DocumentFragment {
        const fragment = document.createDocumentFragment();

        elements.forEach(el => {
            if (el instanceof Node) {
                fragment.appendChild(el);
            }
        });

        return fragment;
    }

    /**
     * Show/hide element based on condition
     */
    export function Show(props: {
        when: boolean | Signal<boolean>
        children: any
    }): JSXElement | null {
        if (isSignal(props.when)) {
            const placeholder = document.createComment('show');
            const parent = document.createDocumentFragment();
            parent.appendChild(placeholder);

            let currentElement: Element | null = null;

            effect(() => {
                const when = props.when as Signal<boolean>;
                const condition = when();

                if (condition && !currentElement) {
                    // Show: create and insert element
                    const children = normalizeChildren(props.children);
                    currentElement = children[0] as Element;

                    if (currentElement instanceof Node) {
                        placeholder.parentNode?.insertBefore(currentElement, placeholder);
                    }
                } else if (!condition && currentElement) {
                    // Hide: remove element
                    currentElement.remove();
                    currentElement = null;
                }
            });

            return parent as any;
        } else {
            // Static condition
            return (props.when as boolean) ? jsx(Fragment, { children: props.children }) : null;
        }
    }

    /**
     * Render different elements based on condition
     */
    export function Switch(props: {
        children: { when: boolean | Signal<boolean>; children: any }[]
    }): JSXElement | null {
        // Find first matching case
        for (const caseItem of props.children) {
            const condition = isSignal(caseItem.when) ? caseItem.when() : caseItem.when;

            if (condition) {
                return jsx(Fragment, { children: caseItem.children });
            }
        }

        return null;
    }

    /**
     * Iterate over array and render elements
     */
    export function For<T>(props: {
        each: T[] | Signal<T[]>
        children: (item: T, index: number) => JSXElement
    }): JSXElement {
        const fragment = document.createDocumentFragment();

        if (isSignal(props.each)) {
            // Reactive list
            const container = document.createElement('div');
            container.style.display = 'contents'; // Don't affect layout

            effect(() => {
                const each = props.each as Signal<T[]>;
                const items = each();
                container.innerHTML = ''; // Clear

                items.forEach((item: any, index: any) => {
                    const element = props.children(item, index);
                    if (element instanceof Node) {
                        container.appendChild(element);
                    }
                });
            });

            fragment.appendChild(container);
        } else {
            // Static list
            const each = props.each as T[];
            each.forEach((item, index) => {
                const element = props.children(item, index);
                if (element instanceof Node) {
                    fragment.appendChild(element);
                }
            });
        }

        return fragment as any;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ ════ ════════════════════════════════════════╗

    export default {
        jsx,
        jsxs,
        Fragment,
        component,
        defineComponent,
        Show,
        Switch,
        For,
        createElements
    };

    export * from './types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝