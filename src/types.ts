/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import type { Signal } from '@minejs/signals';
    import type { JSXElement } from '@minejsx/render';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export type ComponentFunction<P = any> = (props: P) => JSXElement | null;

    export interface JSXProps {
        children?       : any;
        ref?            : Signal<HTMLElement | null>;
        [key: string]   : any;
    }

    // JSX Global Declarations
    declare global {
        // eslint-disable-next-line @typescript-eslint/no-namespace
        namespace JSX {
            type Element            = JSXElement;
            type IntrinsicElements  = Record<string, any>;
            interface ElementChildrenAttribute {
                children: object;
            }
        }
    }

    export type { JSXElement, RenderOptions, MountedComponent } from '@minejsx/render';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝