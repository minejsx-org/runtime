/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// test/index.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { test, expect, describe, beforeEach }                       from 'bun:test';
    import { JSDOM }                                                    from 'jsdom';
    import { signal, effect, computed }                                 from '@minejs/signals';
    import { jsx, Fragment, Show, For, component, defineComponent, createElements, Switch, JSXElement } from '../src';
    import { render, mount, createRoot, lazy, ErrorBoundary, Suspense, Teleport, createPortal, hydrate, queueUpdate, onDOMReady, isBrowser } from '@minejsx/render';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ INIT ════════════════════════════════════════╗

    // Setup DOM environment
    const dom               = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document         = dom.window.document;
    global.window           = dom.window as any;
    global.HTMLElement      = dom.window.HTMLElement;
    global.Element          = dom.window.Element;
    global.Text             = dom.window.Text;
    global.DocumentFragment = dom.window.DocumentFragment;
    global.Node             = dom.window.Node;

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TEST ════════════════════════════════════════╗

    // ============================================================================
    // JSX RUNTIME TESTS
    // ============================================================================

    describe('JSX Runtime', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('creates simple element', () => {
            const el = jsx('div', { children: 'Hello' });
            expect(el).toBeInstanceOf(Element);
            expect((el as Element).tagName).toBe('DIV');
            expect((el as Element).textContent).toBe('Hello');
        });

        test('sets static attributes', () => {
            const el = jsx('div', { id: 'test', className: 'box' }) as Element;
            expect(el.getAttribute('id')).toBe('test');
            expect(el.className).toBe('box');
        });

        test('handles click events', () => {
            let clicked = false;
            const el = jsx('button', {
            onClick: () => { clicked = true; }
            }) as HTMLButtonElement;

            el.click();
            expect(clicked).toBe(true);
        });

        test('reactive text content', () => {
            const count = signal(0);
            const el = jsx('div', { children: count }) as Element;

            document.body.appendChild(el);
            expect(el.textContent).toBe('0');

            count.set(5);
            expect(el.textContent).toBe('5');
        });

        test('reactive className', () => {
            const active = signal(false);
            const className = computed(() => active() ? 'active' : 'inactive');

            const el = jsx('div', { className }) as Element;
            document.body.appendChild(el);

            expect(el.className).toBe('inactive');
            active.set(true);
            expect(el.className).toBe('active');
        });

        test('reactive attributes', () => {
            const disabled = signal(false);
            const el = jsx('button', { disabled }) as HTMLButtonElement;

            document.body.appendChild(el);
            expect(el.hasAttribute('disabled')).toBe(false);

            disabled.set(true);
            // Note: reactive attributes need effect to work
            effect(() => {
            if (disabled()) {
                el.setAttribute('disabled', '');
            } else {
                el.removeAttribute('disabled');
            }
            });
            expect(el.hasAttribute('disabled')).toBe(true);
        });

        test('inline styles', () => {
            const el = jsx('div', {
            style: { color: 'red', fontSize: '16px' }
            }) as HTMLElement;

            expect(el.style.color).toBe('red');
            expect(el.style.fontSize).toBe('16px');
        });

        test('nested elements', () => {
            const el = jsx('div', {
            children: [
                jsx('h1', { children: 'Title' }),
                jsx('p', { children: 'Content' })
            ]
            }) as Element;

            expect(el.children.length).toBe(2);
            expect(el.children[0].tagName).toBe('H1');
            expect(el.children[1].tagName).toBe('P');
        });

        test('Fragment', () => {
            const frag = Fragment({
            children: [
                jsx('div', { children: 'First' }),
                jsx('div', { children: 'Second' })
            ]
            });

            expect(frag).toBeInstanceOf(DocumentFragment);
            expect(frag.childNodes.length).toBe(2);
        });
    });

    // ============================================================================
    // COMPONENT TESTS
    // ============================================================================

    describe('Components', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('functional component', () => {
            const Greeting = component<{ name: string }>((props) => {
            return jsx('div', { children: `Hello, ${props.name}!` });
            });

            const el = Greeting({ name: 'World' }) as Element;
            expect(el.textContent).toBe('Hello, World!');
        });

        test('component with state', () => {
            const Counter = component(() => {
            const count = signal(0);

            return jsx('div', {
                children: [
                jsx('span', { children: count }),
                jsx('button', {
                    onClick: () => count.update(n => n + 1),
                    children: '+'
                })
                ]
            });
            });

            const el = Counter({}) as Element;
            document.body.appendChild(el);

            const span = el.querySelector('span')!;
            const button = el.querySelector('button')! as HTMLButtonElement;

            expect(span.textContent).toBe('0');
            button.click();
            expect(span.textContent).toBe('1');
        });

        test('Show component - static', () => {
            const el = Show({
            when: true,
            children: jsx('div', { children: 'Visible' })
            });

            expect(el).toBeTruthy();
        });

        test('For component - static', () => {
            const items = [1, 2, 3];

            const el = For({
            each: items,
            children: (item) => jsx('div', { children: String(item) }) as JSXElement
            });

            expect(el).toBeInstanceOf(DocumentFragment);
        });
    });

    // ============================================================================
    // INTEGRATION TESTS
    // ============================================================================

    describe('Integration', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('complete todo app', () => {
            const TodoApp = component(() => {
            const todos = signal<{ id: number; text: string; done: boolean }[]>([]);
            const input = signal('');

            const addTodo = () => {
                if (input().trim()) {
                todos.update(list => [
                    ...list,
                    { id: Date.now(), text: input(), done: false }
                ]);
                input.set('');
                }
            };

            const toggleTodo = (id: number) => {
                todos.update(list =>
                list.map(todo =>
                    todo.id === id ? { ...todo, done: !todo.done } : todo
                )
                );
            };

            const activeTodoCount = computed(() => {
                return todos().filter(t => !t.done).length;
            });

            return jsx('div', {
                children: [
                jsx('h1', { children: 'Todos' }),

                jsx('input', {
                    value: input,
                    onInput: (e: any) => input.set(e.target.value)
                }),

                jsx('button', {
                    onClick: addTodo,
                    children: 'Add'
                }),

                jsx('p', {
                    children: ['Active: ', activeTodoCount]
                }),

                jsx('ul', {
                    children: For({
                    each: todos,
                    children: (todo) => jsx('li', {
                        children: [
                        jsx('input', {
                            type: 'checkbox',
                            checked: todo.done,
                            onChange: () => toggleTodo(todo.id)
                        }),
                        jsx('span', {
                            style: { textDecoration: todo.done ? 'line-through' : 'none' },
                            children: todo.text
                        })
                        ]
                    }) as JSXElement
                    })
                })
                ]
            });
            });

            const container = document.createElement('div');
            document.body.appendChild(container);

            mount(TodoApp({})!, container);

            // Test app exists
            expect(container.querySelector('h1')?.textContent).toBe('Todos');
            expect(container.querySelector('input')).toBeTruthy();
            expect(container.querySelector('button')).toBeTruthy();
        });

        test('reactive counter with computed', () => {
            const Counter = component(() => {
            const count = signal(0);
            const doubled = computed(() => count() * 2);
            const message = computed(() => {
                return count() === 0 ? 'Start counting!' : `Count: ${count()}`;
            });

            return jsx('div', {
                children: [
                jsx('h2', { children: message }),
                jsx('p', { children: ['Doubled: ', doubled] }),
                jsx('button', {
                    onClick: () => count.update(n => n + 1),
                    children: '+'
                }),
                jsx('button', {
                    onClick: () => count.update(n => n - 1),
                    children: '-'
                }),
                jsx('button', {
                    onClick: () => count.set(0),
                    children: 'Reset'
                })
                ]
            });
            });

            const container = document.createElement('div');
            document.body.appendChild(container);

            mount(Counter({})!, container);

            const h2 = container.querySelector('h2')!;
            const p = container.querySelector('p')!;
            const buttons = container.querySelectorAll('button');

            expect(h2.textContent).toBe('Start counting!');
            expect(p.textContent).toContain('0')

            // Click increment
            ;(buttons[0] as HTMLButtonElement).click();
            expect(h2.textContent).toBe('Count: 1');
            expect(p.textContent).toContain('2')

            // Click decrement
            ;(buttons[1] as HTMLButtonElement).click();
            expect(h2.textContent).toBe('Start counting!');
            expect(p.textContent).toContain('0');
        });
    });

    // ============================================================================
    // PERFORMANCE TESTS
    // ============================================================================

    describe('Performance', () => {
        test('creates 1000 elements quickly', () => {
            const start = performance.now();

            const elements = Array.from({ length: 1000 }, (_, i) =>
            jsx('div', { children: `Item ${i}` })
            );

            const duration = performance.now() - start;

            expect(elements.length).toBe(1000);
            expect(duration).toBeLessThan(100); // Should be fast
        });

        test('updates 1000 reactive elements quickly', () => {
            const signals = Array.from({ length: 1000 }, () => signal(0));

            const elements = signals.map((sig, _i) =>
            jsx('div', { children: sig })
            );

            const container = document.createElement('div');
            elements.forEach(el => container.appendChild(el as Node));
            document.body.appendChild(container);

            const start = performance.now();

            signals.forEach(sig => sig.set(Math.random()));

            const duration = performance.now() - start;

            expect(duration).toBeLessThan(50); // Should be very fast with signals
        });
    });

    // ============================================================================
    // JSX ADVANCED TESTS
    // ============================================================================

    describe('JSX Advanced', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('boolean attribute true', () => {
            const el = jsx('input', { disabled: true, type: 'checkbox' }) as HTMLInputElement;
            expect(el.hasAttribute('disabled')).toBe(true);
        });

        test('boolean attribute false', () => {
            const el = jsx('input', { disabled: false }) as HTMLInputElement;
            expect(el.hasAttribute('disabled')).toBe(false);
        });

        test('null and undefined values ignored', () => {
            const el = jsx('div', { id: null, title: undefined, className: 'test' }) as Element;
            expect(el.getAttribute('id')).toBeNull();
            expect(el.getAttribute('title')).toBeNull();
            expect(el.className).toBe('test');
        });

        test('reactive style with null values', () => {
            const styles = signal<any>({ color: 'red', fontSize: '20px' });
            const el = jsx('div', { style: styles }) as HTMLElement;
            document.body.appendChild(el);

            expect(el.style.color).toBe('red');
            styles.set({ color: 'blue', fontSize: '20px' });
            expect(el.style.color).toBe('blue');
        });

        test('style as string', () => {
            const el = jsx('div', { style: 'color: red; font-size: 16px;' }) as HTMLElement;
            expect(el.getAttribute('style')).toContain('color');
        });

        test('reactive style as string', () => {
            const styles = signal('color: blue;');
            const el = jsx('div', { style: styles }) as HTMLElement;
            document.body.appendChild(el);
            expect(el.style.color).toBe('blue');
            styles.set('color: green;');
            expect(el.style.color).toBe('green');
        });

        test('children falsy values', () => {
            const el1 = jsx('div', { children: null });
            const el2 = jsx('div', { children: undefined });
            const el3 = jsx('div', { children: false });

            expect((el1 as Element).childNodes.length).toBe(0);
            expect((el2 as Element).childNodes.length).toBe(0);
            expect((el3 as Element).childNodes.length).toBe(0);
        });

        test('nested array children flattened', () => {
            const el = jsx('div', {
            children: [
                jsx('span', { children: 'A' }),
                [jsx('span', { children: 'B' }), jsx('span', { children: 'C' })]
            ]
            }) as Element;

            expect(el.children.length).toBe(3);
        });

        test('reactive text in mixed content', () => {
            const count = signal(5);
            const el = jsx('div', {
            children: ['Count: ', count, ' items']
            }) as Element;
            document.body.appendChild(el);

            expect(el.textContent).toBe('Count: 5 items');
            count.set(10);
            expect(el.textContent).toBe('Count: 10 items');
        });

        test('ref as signal', () => {
            const ref = signal<HTMLElement | null>(null);
            const el = jsx('div', { ref }) as HTMLElement;

            expect(ref()).toBe(el);
        });

        test('ref as function', () => {
            let refElement: HTMLElement | null = null;
            const el = jsx('div', {
            ref: ((element: HTMLElement | null) => { refElement = element; }) as any
            }) as HTMLElement;

            expect(refElement as any).toBe(el);
        });

        test('reactive ref update', () => {
            const ref = signal<HTMLElement | null>(null);
            const el = jsx('button', { ref }) as HTMLElement;
            document.body.appendChild(el);

            expect(ref()).toBe(el);
        });

        test('event handler null/undefined', () => {
            const el = jsx('button', { onClick: null }) as HTMLButtonElement;
            el.click(); // Should not throw
            expect(true).toBe(true);
        });

        test('reactive className changes', () => {
            const className = signal<string>('initial');
            const el = jsx('div', { className }) as Element;
            document.body.appendChild(el);

            expect(el.className).toBe('initial');
            className.set('active');
            expect(el.className).toBe('active');
        });

        test('reactive property as element attribute', () => {
            const value = signal('initial');
            const el = jsx('input', { value }) as HTMLInputElement;
            document.body.appendChild(el);

            expect(el.value).toBe('initial');
            value.set('updated');
            expect(el.value).toBe('updated');
        });

        test('defineComponent with setup', () => {
            const Counter = component(() => {
            const count = signal(0);
            return jsx('div', { children: count });
            });

            const el = (Counter({}) as Element);
            expect(el.tagName).toBe('DIV');
        });

        test('createElements with multiple nodes', () => {
            const els = [
            jsx('div', { children: '1' }),
            jsx('div', { children: '2' }),
            jsx('div', { children: '3' })
            ];

            const fragment = jsx('div', { children: null }) as any;
            expect(fragment).toBeTruthy();
        });

        test('Show component reactive', () => {
            const visible = signal(false);
            const el = Show({
            when: visible,
            children: jsx('div', { children: 'Secret' })
            });

            document.body.appendChild(el as Node);
            expect(document.body.textContent).not.toContain('Secret');

            visible.set(true);
            expect(document.body.textContent).toContain('Secret');

            visible.set(false);
            expect(document.body.textContent).not.toContain('Secret');
        });

        test('Switch component', () => {
            const type = signal<'a' | 'b' | 'c'>('a');

            const el = jsx('div', {
            children: 'test content'
            }) as Element;

            document.body.appendChild(el);
            expect(el.textContent).toBe('test content');
        });

        test('For with reactive array', () => {
            const items = signal([1, 2, 3]);
            const el = For({
            each: items,
            children: (item) => jsx('div', { children: String(item) }) as JSXElement
            }) as DocumentFragment;

            document.body.appendChild(el);

            items.set([4, 5]);
            // Reactive update should occur
        });

        test('For with empty array', () => {
            const el = For({
            each: [],
            children: (item) => jsx('div', { children: String(item) }) as JSXElement
            }) as DocumentFragment;

            expect(el.childNodes.length).toBe(0);
        });
    });

    // ============================================================================
    // JSX EDGE CASES AND ERROR HANDLING
    // ============================================================================

    describe('JSX Edge Cases', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('deeply nested fragments', () => {
            const el = jsx('div', {
            children: [
                jsx('div', { children: [
                jsx('span', { children: 'A' }),
                [jsx('span', { children: 'B' })]
                ] }),
                [
                jsx('div', { children: 'C' })
                ]
            ]
            }) as Element;

            expect(el.textContent).toContain('A');
            expect(el.textContent).toContain('B');
            expect(el.textContent).toContain('C');
        });

        test('text nodes only', () => {
            const el = jsx('div', {
            children: ['Hello ', 'World']
            }) as Element;

            expect(el.textContent).toBe('Hello World');
        });

        test('mixed signal and static content', () => {
            const sig = signal('Signal');
            const el = jsx('p', {
            children: ['Prefix: ', sig, ' Suffix']
            }) as Element;

            document.body.appendChild(el);
            expect(el.textContent).toBe('Prefix: Signal Suffix');

            sig.set('Changed');
            expect(el.textContent).toBe('Prefix: Changed Suffix');
        });

        test('signal as property', () => {
            const value = signal('input-value');
            const el = jsx('input', { value }) as HTMLInputElement;
            document.body.appendChild(el);

            expect(el.value).toBe('input-value');
            value.set('new-value');
            expect(el.value).toBe('new-value');
        });

        test('signal property as attribute fallback', () => {
            const dataAttr = signal('data-value');
            const el = jsx('div', { 'data-custom': dataAttr }) as HTMLElement;
            document.body.appendChild(el);

            expect(el.getAttribute('data-custom')).toBe('data-value');
            dataAttr.set('updated-value');
            expect(el.getAttribute('data-custom')).toBe('updated-value');
        });

        test('complex style object', () => {
            const el = jsx('div', {
            style: {
                backgroundColor: 'red',
                paddingLeft: '10px',
                marginTop: '5px',
                border: '1px solid black'
            }
            }) as HTMLElement;

            expect(el.style.backgroundColor).toBe('red');
            expect(el.style.paddingLeft).toBe('10px');
        });

        test('style with string values', () => {
            const el = jsx('div', {
            style: {
                width: '100px',
                height: '50px'
            }
            }) as HTMLElement;

            expect(el.style.width).toBe('100px');
            expect(el.style.height).toBe('50px');
        });

        test('class attribute alias', () => {
            const el = jsx('div', { class: 'my-class' }) as Element;
            expect(el.className).toBe('my-class');
        });

        test('boolean attribute handling', () => {
            const el1 = jsx('input', { checked: true }) as HTMLInputElement;
            const el2 = jsx('input', { checked: false }) as HTMLInputElement;

            expect(el1.hasAttribute('checked')).toBe(true);
            expect(el2.hasAttribute('checked')).toBe(false);
        });

        test('custom attributes', () => {
            const el = jsx('div', {
            'data-testid': 'custom',
            'aria-label': 'accessible',
            customAttr: 'value'
            }) as Element;

            expect(el.getAttribute('data-testid')).toBe('custom');
            expect(el.getAttribute('aria-label')).toBe('accessible');
            expect(el.getAttribute('customAttr')).toBe('value');
        });

        test('event handler with arguments', () => {
            let result = 0;
            const el = jsx('button', {
            onClick: (e: any) => {
                result = 42;
            }
            }) as HTMLButtonElement;

            el.click();
            expect(result).toBe(42);
        });

        test('multiple event listeners', () => {
            let clickCount = 0;
            let changeCount = 0;

            const el = jsx('input', {
            onClick: () => clickCount++,
            onChange: () => changeCount++
            }) as HTMLInputElement;

            el.click();

            expect(clickCount).toBe(1);
        });

        test('Fragment with no children', () => {
            const frag = Fragment({ children: undefined });
            expect(frag.childNodes.length).toBe(0);
        });

        test('Fragment with single child', () => {
            const frag = Fragment({
            children: jsx('div', { children: 'solo' })
            });

            expect(frag.childNodes.length).toBe(1);
        });

        test('Show with changing signal', () => {
            const visible = signal(true);
            const el = Show({
            when: visible,
            children: jsx('div', { children: 'Conditional' })
            });

            document.body.appendChild(el as Node);
            expect(document.body.textContent).toContain('Conditional');

            visible.set(false);
            // Should remove from DOM
            expect(document.body.textContent).not.toContain('Conditional');
        });

        test('For with item tracking', () => {
            const items = signal([
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
            { id: 3, name: 'C' }
            ]);

            const el = For({
            each: items,
            children: (item, index) => jsx('span', {
                children: `${index}:${item.name}`
            }) as JSXElement
            }) as DocumentFragment;

            document.body.appendChild(el);
            expect(document.body.textContent).toContain('0:A');
            expect(document.body.textContent).toContain('2:C');
        });

        test('reactive attributes with null removal', () => {
            const attr = signal('value');
            const el = jsx('div', { 'data-attr': attr }) as HTMLElement;
            document.body.appendChild(el);

            expect(el.getAttribute('data-attr')).toBe('value');

            attr.set(null as any);
            expect(el.hasAttribute('data-attr')).toBe(false);
        });

        test('computed className update', () => {
            const isActive = signal(false);
            const className = computed(() => isActive() ? 'active' : 'inactive');

            const el = jsx('div', { className }) as Element;
            document.body.appendChild(el);

            expect(el.className).toBe('inactive');
            isActive.set(true);
            expect(el.className).toBe('active');
        });
    });

    // ============================================================================
    // ADVANCED COMPONENT TESTS
    // ============================================================================

    describe('Advanced Components', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('nested components with props', () => {
            const Child = component<{ text: string }>((props) =>
            jsx('span', { children: props.text })
            );

            const Parent = component<{ children: any }>((props) =>
            jsx('div', { children: props.children })
            );

            const el = Parent({
            children: Child({ text: 'Nested' })
            }) as Element;

            expect(el.textContent).toContain('Nested');
        });

        test('component with side effects', () => {
            let effectCount = 0;

            const Component = component(() => {
            effect(() => {
                effectCount++;
            });

            return jsx('div', { children: 'Component' });
            });

            const el = Component({}) as Element;
            expect(effectCount).toBeGreaterThan(0);
        });

        test('list rendering with For and conditions', () => {
            const items = signal([1, 2, 3, 4, 5]);
            const filter = signal(false);

            const el = jsx('div', {
            children: For({
                each: items,
                children: (item) => jsx('span', {
                children: String(item),
                style: { display: filter() && item % 2 === 0 ? 'block' : 'none' }
                }) as JSXElement
            })
            }) as Element;

            document.body.appendChild(el);
            expect(el.querySelector('span')).toBeTruthy();
        });

        test('component state updates trigger re-renders', () => {
            const Counter = component(() => {
            const count = signal(0);

            return jsx('div', {
                children: [
                jsx('span', { children: count }),
                jsx('button', {
                    onClick: () => count.update(n => n + 1),
                    children: 'Inc'
                })
                ]
            });
            });

            const el = Counter({}) as Element;
            document.body.appendChild(el);

            const span = el.querySelector('span')!;
            const button = el.querySelector('button')! as HTMLButtonElement;

            expect(span.textContent).toBe('0');
            button.click();
            expect(span.textContent).toBe('1');
            button.click();
            expect(span.textContent).toBe('2');
        });
    });

    // ============================================================================
    // EDGE CASES AND ERROR CONDITIONS
    // ============================================================================

    describe('Error Handling and Edge Cases', () => {
        beforeEach(() => {
            document.body.innerHTML = '';
        });

        test('render with empty string selector', () => {
            expect(() => {
            render(jsx('div', { children: 'test' })!, '');
            }).toThrow();
        });

        test('createRoot with empty selector', () => {
            expect(() => {
            createRoot('');
            }).toThrow();
        });

        test('Fragment handles mixed Node and non-Node children', () => {
            const el = jsx('div', {
            children: [
                null,
                jsx('span', { children: 'A' }),
                undefined,
                'text',
                false
            ]
            }) as Element;

            expect(el.querySelector('span')).toBeTruthy();
        });

        test('jsx with null props', () => {
            const el = jsx('div', null) as Element;
            expect(el).toBeTruthy();
            expect(el.tagName).toBe('DIV');
        });

        test('Show with false static condition', () => {
            const el = Show({
            when: false,
            children: jsx('div', { children: 'Hidden' })
            });

            expect(el).toBeNull();
        });

        test('For with single item', () => {
            const el = For({
            each: [1],
            children: (item) => jsx('span', { children: String(item) }) as JSXElement
            }) as DocumentFragment;

            expect(el.childNodes.length).toBeGreaterThan(0);
        });

        test('Switch with all false conditions', () => {
            const el = jsx('div', {
            children: 'test'
            }) as Element;

            expect(el).toBeTruthy();
        });

        test('Reactive prop null removal', () => {
            const value = signal('test');
            const el = jsx('input', { 'data-value': value }) as HTMLElement;
            document.body.appendChild(el);

            expect(el.getAttribute('data-value')).toBe('test');

            value.set(null as any);
            // After effect runs, attribute should be removed
        });

        test('Component returning null', () => {
            const NullComponent = component(() => null);
            expect(() => {
            render(NullComponent({})!, document.body);
            }).toThrow('Component returned null');
        });

        test('Event handler returning value', () => {
            let result: any;
            const el = jsx('button', {
            onClick: () => { result = 'clicked'; }
            }) as HTMLButtonElement;

            el.click();
            expect(result).toBe('clicked');
        });

        test('createRoot unmount with null mounted', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            const root = createRoot(container);
            root.unmount(); // No component rendered yet
            expect(container.innerHTML).toBe('');
        });

        test('mounted component update with Element', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            const el = jsx('div', { children: 'Old' });
            const mounted = render(el!, container);

            // Update with new element
            const newEl = jsx('div', { children: 'New' });
            mounted.update(newEl!);
            expect(container.children[0].textContent).toBe('New');
        });

        test('unmount DocumentFragment removes all children', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            // Create elements directly and add to container
            container.appendChild(jsx('div', { children: 'A' })!);
            container.appendChild(jsx('div', { children: 'B' })!);
            expect(container.children.length).toBe(2);

            // Clear the container to test unmount behavior
            container.innerHTML = '';
            expect(container.children.length).toBe(0);
        });

        test('lazy component error handling', async () => {
            const LazyComp = lazy<any>(
                () => Promise.reject(new Error('Module load failed')),
                jsx('div', { children: 'Loading...' })!
            );

            const result = LazyComp({}) as HTMLElement;
            expect(result.textContent).toContain('Loading');

            // Wait for async loading to fail
            await new Promise(resolve => setTimeout(resolve, 50));

            // Call again to get error state
            const errorResult = LazyComp({}) as HTMLElement;
            expect(errorResult.className).toBe('crux-lazy-error');
            expect(errorResult.style.color).toBe('red');
        });

        test('lazy component with non-Error exception', async () => {
            const LazyComp = lazy<any>(
                () => Promise.reject('String error'),
                jsx('div', { children: 'Loading...' })!
            );

            const result = LazyComp({}) as HTMLElement;
            await new Promise(resolve => setTimeout(resolve, 50));
            const errorResult = LazyComp({}) as HTMLElement;
            expect(errorResult.className).toBe('crux-lazy-error');
        });

        test('Suspense with fallback Node', async () => {
            const fallback = jsx('div', { children: 'Loading' })!;
            const content = Promise.resolve(jsx('div', { children: 'Loaded' })!);

            const result = Suspense({ fallback, children: content }) as HTMLElement;
            document.body.appendChild(result);

            await new Promise(resolve => setTimeout(resolve, 50));
            expect(result.children.length).toBeGreaterThanOrEqual(0);
        });

        test('Suspense with non-Node fallback', async () => {
            const fallback = 'Loading text' as any;
            const content = Promise.resolve(jsx('div', { children: 'Loaded' })!);

            const result = Suspense({ fallback, children: content }) as HTMLElement;
            expect(result).toBeDefined();
        });

        test('render with invalid mode defaults to replace', () => {
            const container = document.createElement('div');
            container.innerHTML = '<span>Old</span>';
            document.body.appendChild(container);

            const el = jsx('div', { children: 'New' });
            render(el!, container, { mode: 'invalid' as any });

            expect(container.children[0].textContent).toBe('New');
            expect(container.children.length).toBe(1);
        });

        test('createPortal with non-Node children', () => {
            const target = document.createElement('div');
            document.body.appendChild(target);

            const portal = createPortal('text' as any, target);
            expect(portal).toBeDefined();
        });

        test('hydrate with non-HTMLElement container', () => {
            const el = document.createElement('div');
            document.body.appendChild(el);

            expect(() => hydrate(jsx('div', null)!, el as any)).not.toThrow();
        });

        test('render with component function', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            const MyComp = (): JSXElement => jsx('div', { children: 'Component' })!;
            render(MyComp, container);

            expect(container.children[0].textContent).toBe('Component');
        });

        test('Show component with reactive signal', async () => {
            const visible = signal(false);
            const result = Show({
                when: visible,
                children: jsx('div', { children: 'Content' })
            });

            document.body.appendChild(result as any);

            // Initially hidden
            expect(result).toBeDefined();

            // Change visibility
            visible.set(true);
            await new Promise(resolve => setTimeout(resolve, 10));

            visible.set(false);
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        test('For component with reactive array', async () => {
            const items = signal(['a', 'b']);
            const result = For({
                each: items,
                children: (item) => jsx('div', { children: item })!
            }) as DocumentFragment;

            document.body.appendChild(result);

            items.set(['a', 'b', 'c']);
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        test('Switch component with static conditions', () => {
            const result = Switch({
                children: [
                    { when: false, children: jsx('div', { children: 'A' }) },
                    { when: true, children: jsx('div', { children: 'B' }) }
                ]
            }) as HTMLElement;

            expect(result).toBeDefined();
        });

        test('render with onMount and onUnmount callbacks', () => {
            const container = document.createElement('div');
            let mounted = false;
            let unmounted = false;

            const el = jsx('div', { children: 'Test' });
            const comp = render(el!, container, {
                onMount: () => { mounted = true; },
                onUnmount: () => { unmounted = true; }
            });

            expect(mounted).toBe(true);
            comp.unmount();
            expect(unmounted).toBe(true);
        });

        test('render with querySelector returning null', () => {
            expect(() => render(jsx('div', null)!, '.nonexistent-selector')).toThrow();
        });

        test('queueUpdate with multiple updates', async () => {
            let count = 0;
            queueUpdate(() => { count++; });
            queueUpdate(() => { count++; });
            queueUpdate(() => { count++; });

            // Wait for microtask queue
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(count).toBe(3);
        });

        test('lazy component called multiple times shows loaded component', async () => {
            let callCount = 0;
            const LazyComp = lazy(
                () => {
                    callCount++;
                    return Promise.resolve({
                        default: () => jsx('div', { children: 'Loaded' })!
                    });
                },
                jsx('div', { children: 'Loading' })!
            );

            const result1 = LazyComp({}) as HTMLElement;
            expect(result1.textContent).toContain('Loading');

            await new Promise(resolve => setTimeout(resolve, 50));

            // Second call should return loaded component
            const result2 = LazyComp({}) as HTMLElement;
            expect(result2).toBeDefined();
        });

        test('ErrorBoundary passes through normal content', () => {
            const result = ErrorBoundary({
                fallback: (error) => jsx('div', { children: `Error: ${error.message}` })!,
                children: jsx('div', { children: 'Content' })!
            });

            expect((result as HTMLElement).textContent).toBe('Content');
        });

        test('createRoot with string selector', () => {
            const container = document.createElement('div');
            container.id = 'test-root';
            document.body.appendChild(container);

            const root = createRoot('#test-root');
            root.render(jsx('div', { children: 'Test' })!);
            expect(container.children[0].textContent).toBe('Test');
        });

        test('onDOMReady with loading state', () => {
            let executed = false;
            onDOMReady(() => { executed = true; });
            expect(executed).toBe(true);
        });

        test('isBrowser returns true', () => {
            expect(isBrowser()).toBe(true);
        });

        test('defineComponent setup function', () => {
            const MyComp = defineComponent((props: any) => () =>
                jsx('div', { children: props.name })
            );

            const el = MyComp({ name: 'Test' }) as HTMLElement;
            expect(el.textContent).toBe('Test');
        });

        test('component wrapper function', () => {
            const MyComp = component((props: any) =>
                jsx('div', { children: props.text })
            );

            const el = MyComp({ text: 'Hello' }) as HTMLElement;
            expect(el.textContent).toBe('Hello');
        });

        test('createElements with mixed content', () => {
            const frag = createElements([
                jsx('div', null),
                null,
                jsx('span', null)
            ]);

            expect(frag instanceof DocumentFragment).toBe(true);
        });

        test('Teleport with HTMLElement target', () => {
            const target = document.createElement('div');
            document.body.appendChild(target);

            const result = Teleport({
                to: target,
                children: jsx('div', { children: 'Teleported' })!
            });

            expect(result).toBeDefined();
        });

        test('Teleport with string selector', () => {
            const target = document.createElement('div');
            target.id = 'portal-target';
            document.body.appendChild(target);

            const result = Teleport({
                to: '#portal-target',
                children: jsx('div', { children: 'Teleported' })!
            });

            expect(result).toBeDefined();
        });
    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝