<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="logo" style="" height="60" />
    </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/v-0.0.3-black"/>
    <img src="https://img.shields.io/badge/🔥-@minejsx-black"/>
    <br>
    <img src="https://img.shields.io/badge/coverage-98.98%25-brightgreen" alt="Test Coverage" />
    <img src="https://img.shields.io/github/issues/minejsx-org/runtime?style=flat" alt="Github Repo Issues" />
    <img src="https://img.shields.io/github/stars/minejsx-org/runtime?style=social" alt="GitHub Repo stars" />
</div>
<br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->

- ## Quick Start 🔥

    > **_Lightweight JSX runtime with fine-grained reactivity._**

    - ### Setup

        > install [`hmm`](https://github.com/minejs-org/hmm) first.

        ```bash
        hmm i @minejsx/runtime
        ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### Usage

        ```ts
        import { jsx, Fragment, Show, For, Switch, component, defineComponent } from '@minejsx/runtime'
        import { signal, effect, computed } from '@minejs/signals'
        ```

        - ### 1. Basic JSX Element Creation

            ```typescript
            // Create simple HTML element
            const div = jsx('div', {
                className: 'container',
                children: 'Hello World'
            })

            // Create element with attributes and events
            const button = jsx('button', {
                id: 'submit',
                children: 'Click me',
                onClick: () => console.log('Clicked!')
            })
            ```

        - ### 2. Reactive Content with Signals

            ```typescript
            import { render } from '@minejsx/render'
            import { signal } from '@minejs/signals'

            const count = signal(0)

            const el = jsx('div', {
                children: count  // Automatically updates when signal changes
            })

            render(el, '#app')

            count.set(5) // DOM updates automatically!
            ```

        - ### 3. Event Handling

            ```typescript
            const counter = signal(0)

            const button = jsx('button', {
                children: 'Increment',
                onClick: () => {
                    counter.update(n => n + 1)
                }
            })
            ```

        - ### 4. Reactive Attributes and Styles

            ```typescript
            const disabled = signal(false)
            const bgColor = signal('blue')

            const btn = jsx('button', {
                disabled,  // Reactive attribute
                style: { backgroundColor: bgColor },  // Reactive style
                children: 'Submit'
            })
            ```

        - ### 5. Control Flow - Show Component

            ```typescript
            const isVisible = signal(true)

            const element = Show({
                when: isVisible(),
                children: jsx('div', { children: 'Visible content' })
            })
            ```

        - ### 6. Control Flow - For Loop

            ```typescript
            const items = signal(['Apple', 'Banana', 'Orange'])

            const list = For({
                each: items(),
                children: (item, index) => jsx('li', { 
                    children: `${index}: ${item}`
                })
            })
            ```

        - ### 7. Switch - Multiple Conditions

            ```typescript
            const status = signal('loading')

            const statusDisplay = Switch({
                children: [
                    { when: status() === 'loading', children: jsx('div', { children: 'Loading...' }) },
                    { when: status() === 'error', children: jsx('div', { children: 'Error!' }) },
                    { when: status() === 'success', children: jsx('div', { children: 'Success!' }) }
                ]
            })
            ```

        - ### 8. Creating Components

            ```typescript
            // Functional component
            const Greeting = component<{ name: string }>((props) => {
                return jsx('h1', { children: `Hello, ${props.name}!` })
            })

            // Use component
            const greeting = Greeting({ name: 'World' })
            ```

        - ### 9. Components with Setup Function

            ```typescript
            const Counter = defineComponent((props) => {
                const count = signal(0)

                return () => jsx('div', {
                    children: [
                        jsx('h2', { children: `Count: ${count()}` }),
                        jsx('button', {
                            onClick: () => count.update(n => n + 1),
                            children: 'Increment'
                        })
                    ]
                })
            })
            ```

        - ### 10. Using Refs

            ```typescript
            const inputRef = signal<HTMLInputElement | null>(null)

            const input = jsx('input', {
                ref: inputRef,  // Access DOM element
                type: 'text'
            })

            // Later: access the element
            inputRef()?.focus()
            ```

    <br>

- ## Core Types 🔥

    - #### `ComponentFunction<P = any>`
        > Type for a function that accepts props and returns JSX elements.

        ```typescript
        type ComponentFunction<P = any> = (props: P) => JSXElement | null
        ```

    - #### `JSXProps`
        > Interface for JSX element properties.

        ```typescript
        interface JSXProps {
            children?       : any
            ref?            : Signal<HTMLElement | null>
            [key: string]   : any
        }
        ```

    - #### `JSXElement`
        > Type for JSX elements (imported from @minejsx/render).

        ```typescript
        type JSXElement = Element | DocumentFragment | null
        ```

    <br>

- ## API Reference 🔥

    - #### `jsx<P = any>(type: string | ComponentFunction, props: JSXProps | null): JSXElement | null`
        > Create a DOM element from JSX syntax.

        ```typescript
        // HTML element
        const div = jsx('div', {
            className: 'box',
            children: 'Content'
        })

        // Component
        const Greeting = (props) => jsx('h1', { children: `Hello, ${props.name}!` })
        const greeting = jsx(Greeting, { name: 'John' })
        ```

    - #### `jsxs(type: string | ComponentFunction, props: JSXProps | null): JSXElement | null`

        > Alias for jsx(). Used automatically by TypeScript JSX transform for multiple children.

        ```typescript
        const el = jsxs('div', {
            children: [
                jsx('h1', { children: 'Title' }),
                jsx('p', { children: 'Paragraph' })
            ]
        })
        ```

    - #### `Fragment(props: { children?: any }): DocumentFragment`

        > Create a DocumentFragment to group elements without adding a wrapper element.

        ```typescript
        const frag = Fragment({
            children: [
                jsx('div', { children: 'First' }),
                jsx('div', { children: 'Second' })
            ]
        })
        ```

    - #### `component<P = any>(fn: (props: P) => JSXElement | null): ComponentFunction<P>`

        > Create a component from a function. Provides a cleaner API than raw JSX functions.

        ```typescript
        const Button = component<{ label: string }>((props) => {
            return jsx('button', { children: props.label })
        })
        ```

    - #### `defineComponent<P = any>(setup: (props: P) => () => JSXElement | null): ComponentFunction<P>`

        > Create a component with a setup function (similar to Vue Composition API).

        ```typescript
        const Counter = defineComponent((props) => {
            const count = signal(0)

            return () => jsx('div', {
                children: `Count: ${count()}`
            })
        })
        ```

    - #### `Show(props: { when: boolean | Signal<boolean>, children: any }): JSXElement | null`

        > Conditionally render content based on a boolean condition. Supports static or reactive conditions.

        ```typescript
        const isLoggedIn = signal(false)

        Show({
            when: isLoggedIn(),
            children: jsx('div', { children: 'Welcome back!' })
        })
        ```

    - #### `Switch(props: { children: { when: boolean | Signal<boolean>, children: any }[] }): JSXElement | null`

        > Render first matching condition. Similar to switch/case in JavaScript.

        ```typescript
        const status = signal('loading')

        Switch({
            children: [
                { when: status() === 'loading', children: jsx('div', { children: 'Loading...' }) },
                { when: status() === 'error', children: jsx('div', { children: 'Error!' }) },
                { when: status() === 'success', children: jsx('div', { children: 'Success!' }) }
            ]
        })
        ```

    - #### `For<T>(props: { each: T[] | Signal<T[]>, children: (item: T, index: number) => JSXElement }): JSXElement`

        > Render a list of items. Supports static arrays or reactive signals.

        ```typescript
        const todos = signal([
            { id: 1, text: 'Learn JSX' },
            { id: 2, text: 'Build app' }
        ])

        For({
            each: todos(),
            children: (todo) => jsx('li', { children: todo.text })
        })
        ```

    - #### `createElements(elements: any[]): DocumentFragment`

        > Create multiple elements at once and return them as a DocumentFragment.

        ```typescript
        const fragment = createElements([
            jsx('div', { children: 'First' }),
            jsx('span', { children: 'Second' }),
            jsx('button', { children: 'Third' })
        ])
        ```

    <br>

- ## Reactive Features 🔥

    - ### Reactive Text Content

        > Text nodes automatically update when signal values change.

        ```typescript
        const count = signal(0)

        const el = jsx('div', {
            children: count  // Updates when count changes
        })

        render(el, '#app')
        count.set(5)  // DOM automatically updated
        ```

    - ### Reactive Attributes

        > Attributes automatically update when signal values change.

        ```typescript
        const disabled = signal(false)

        const button = jsx('button', {
            disabled,  // Updates when signal changes
            children: 'Submit'
        })

        render(button, '#app')
        disabled.set(true)  // Attribute updated
        ```

    - ### Reactive Styles

        > Both object and string styles are reactive.

        ```typescript
        const bgColor = signal('blue')

        // Object style
        const el1 = jsx('div', {
            style: { backgroundColor: bgColor }
        })

        // String style
        const el2 = jsx('div', {
            style: bgColor.map(color => `background-color: ${color}`)
        })
        ```

    - ### Reactive Classes

        > ClassName automatically updates when signal value changes.

        ```typescript
        const active = signal(false)

        const el = jsx('div', {
            className: active.map(a => a ? 'active' : 'inactive')
        })
        ```

    - ### Event Handlers

        > Support for standard HTML event handlers with camelCase naming.

        ```typescript
        const handleClick = () => console.log('clicked')

        const button = jsx('button', {
            onClick: handleClick,
            onInput: (e: Event) => console.log(e),
            onChange: (e: Event) => console.log(e),
            onFocus: () => console.log('focused')
        })
        ```

    - ### Ref Access

        > Access DOM elements via refs using signals.

        ```typescript
        const inputRef = signal<HTMLInputElement | null>(null)

        const input = jsx('input', {
            ref: inputRef
        })

        // Later access the element
        inputRef()?.focus()
        inputRef()?.value
        ```

    <br>

- ## Real-World Examples

  - #### Counter Component with Signals

    ```typescript
    import { jsx, component } from '@minejsx/runtime'
    import { render } from '@minejsx/render'
    import { signal } from '@minejs/signals'

    const Counter = component(() => {
        const count = signal(0)

        return jsx('div', {
            className: 'counter',
            children: [
                jsx('h2', { children: `Count: ${count()}` }),
                jsx('button', {
                    onClick: () => count.update(n => n + 1),
                    children: 'Increment'
                }),
                jsx('button', {
                    onClick: () => count.update(n => n - 1),
                    children: 'Decrement'
                })
            ]
        })
    })

    render(Counter({}), '#app')
    ```

  - #### Todo Application

    ```typescript
    import { jsx, component, For } from '@minejsx/runtime'
    import { render } from '@minejsx/render'
    import { signal, computed } from '@minejs/signals'

    interface Todo {
        id: number
        text: string
        done: boolean
    }

    const TodoApp = component(() => {
        const todos = signal<Todo[]>([])
        const input = signal('')

        const addTodo = () => {
            if (input().trim()) {
                todos.update(list => [
                    ...list,
                    { id: Date.now(), text: input(), done: false }
                ])
                input.set('')
            }
        }

        const toggleTodo = (id: number) => {
            todos.update(list =>
                list.map(todo =>
                    todo.id === id ? { ...todo, done: !todo.done } : todo
                )
            )
        }

        const activeTodoCount = computed(() => {
            return todos().filter(t => !t.done).length
        })

        return jsx('div', {
            className: 'todo-app',
            children: [
                jsx('h1', { children: 'Todos' }),
                jsx('input', {
                    value: input,
                    placeholder: 'Add a todo...',
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
                                    style: {
                                        textDecoration: todo.done ? 'line-through' : 'none'
                                    },
                                    children: todo.text
                                })
                            ]
                        })
                    })
                })
            ]
        })
    })

    render(TodoApp({}), '#app')
    ```

  - #### Form with Computed Validation

    ```typescript
    import { jsx, component, Show } from '@minejsx/runtime'
    import { render } from '@minejsx/render'
    import { signal, computed } from '@minejs/signals'

    const LoginForm = component(() => {
        const email = signal('')
        const password = signal('')

        const isEmailValid = computed(() => {
            return email().includes('@') && email().length > 3
        })

        const isPasswordValid = computed(() => {
            return password().length >= 8
        })

        const canSubmit = computed(() => {
            return isEmailValid() && isPasswordValid()
        })

        return jsx('form', {
            children: [
                jsx('div', {
                    children: [
                        jsx('label', { children: 'Email:' }),
                        jsx('input', {
                            type: 'email',
                            value: email,
                            onInput: (e: any) => email.set(e.target.value)
                        }),
                        Show({
                            when: !isEmailValid(),
                            children: jsx('span', {
                                style: { color: 'red' },
                                children: 'Invalid email'
                            })
                        })
                    ]
                }),
                jsx('div', {
                    children: [
                        jsx('label', { children: 'Password:' }),
                        jsx('input', {
                            type: 'password',
                            value: password,
                            onInput: (e: any) => password.set(e.target.value)
                        }),
                        Show({
                            when: !isPasswordValid(),
                            children: jsx('span', {
                                style: { color: 'red' },
                                children: 'Password must be at least 8 characters'
                            })
                        })
                    ]
                }),
                jsx('button', {
                    type: 'submit',
                    disabled: !canSubmit(),
                    children: 'Login'
                })
            ]
        })
    })

    render(LoginForm({}), '#app')
    ```

  - #### Dynamic List with Filtering

    ```typescript
    import { jsx, component, For } from '@minejsx/runtime'
    import { render } from '@minejsx/render'
    import { signal, computed } from '@minejs/signals'

    const FilteredList = component(() => {
        const items = signal(['React', 'Vue', 'Svelte', 'SolidJS', 'Angular'])
        const searchTerm = signal('')

        const filtered = computed(() => {
            const term = searchTerm().toLowerCase()
            return items().filter(item => item.toLowerCase().includes(term))
        })

        return jsx('div', {
            children: [
                jsx('input', {
                    placeholder: 'Search...',
                    value: searchTerm,
                    onInput: (e: any) => searchTerm.set(e.target.value)
                }),
                jsx('ul', {
                    children: For({
                        each: filtered,
                        children: (item) => jsx('li', { children: item })
                    })
                })
            ]
        })
    })

    render(FilteredList({}), '#app')
    ```

  - #### Component Composition

    ```typescript
    import { jsx, component } from '@minejsx/runtime'
    import { render } from '@minejsx/render'
    import { signal } from '@minejs/signals'

    const Button = component<{ onClick: () => void; children: string }>((props) => {
        return jsx('button', {
            onClick: props.onClick,
            className: 'btn',
            children: props.children
        })
    })

    const Card = component<{ title: string; children: any }>((props) => {
        return jsx('div', {
            className: 'card',
            children: [
                jsx('h3', { children: props.title }),
                jsx('div', { className: 'card-body', children: props.children })
            ]
        })
    })

    const App = component(() => {
        const counter = signal(0)

        return jsx('div', {
            children: [
                jsx(Card, {
                    title: 'Counter',
                    children: [
                        jsx('p', { children: `Count: ${counter()}` }),
                        jsx(Button, {
                            onClick: () => counter.update(n => n + 1),
                            children: 'Click me'
                        })
                    ]
                })
            ]
        })
    })

    render(App({}), '#app')
    ```


- ## More 🔥

    - ### Vanilla Setup (No Framework)

        - #### HTML :

            ```html
            <!DOCTYPE html>
            <html>
            <head>
                <title>My App</title>
                <style>
                    .counter { padding: 20px; }
                    button { padding: 8px 16px; }
                </style>
            </head>
            <body>
                <div id="app"></div>
                <script type="module" src="./app.ts"></script>
            </body>
            </html>
            ```

        - #### TypeScript/JavaScript (app.ts)

            ```typescript
            import { jsx } from '@minejsx/runtime'
            import { render } from '@minejsx/render'
            import { signal } from '@minejs/signals'

            const count = signal(0)

            const app = jsx('div', {
                className: 'counter',
                children: [
                    jsx('h1', { children: `Count: ${count()}` }),
                    jsx('button', {
                        onClick: () => count.update(n => n + 1),
                        children: 'Increment'
                    })
                ]
            })

            render(app, '#app')
            ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### With JSX Transform (.tsx/.jsx)

        - #### TypeScript Configuration (tsconfig.json)

            ```json
            {
                "compilerOptions": {
                    "jsx": "react-jsx",
                    "jsxImportSource": "@minejsx/runtime",
                    "target": "ES2020",
                    "module": "ES2020",
                    "strict": true
                }
            }
            ```

        - #### Component File (Counter.tsx)

            ```tsx
            import { signal } from '@minejs/signals'
            import { JSXElement } from '@minejsx/runtime'

            export function Counter(): JSXElement {
                const count = signal(0)

                return (
                    <div className="counter">
                        <h2>Count: {count()}</h2>
                        <button onClick={() => count.update(n => n + 1)}>
                            Increment
                        </button>
                        <button onClick={() => count.update(n => n - 1)}>
                            Decrement
                        </button>
                    </div>
                )
            }
            ```

        - #### Main App (app.tsx)

            ```tsx
            import { render } from '@minejsx/render'
            import { Counter } from './Counter'

            render(<Counter />, '#app')
            ```

- ## Testing 🔥

    The runtime includes comprehensive test coverage using Bun test framework.

    - ### Run Tests

        ```bash
        bun test
        ```

    - ### Test Coverage

        ```bash
        bun test --coverage
        ```

    - ### Test Categories

        - **JSX Runtime Tests**: Element creation, attributes, events
        - **Component Tests**: Functional components, state management
        - **Integration Tests**: Complete apps with signals and computed
        - **Performance Tests**: Creation and update performance
        - **Advanced Tests**: Refs, styles, boolean attributes, nested children

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

<br>

---

<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->
