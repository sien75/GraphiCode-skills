# Pages

Since React functional components are not classes, to adapt to the GraphiCode development paradigm, internal states need to be exported via hooks and captured by a new State instance. See the example below:

```md
# method
getCount: () -> void
increase: () -> void
decrease: () -> void

# event
count: (cb: (count: number) -> void) -> void
getCountSuccess: (cb: (count: number) -> void) -> void

# resides-in
browser-DOM

# description
This state is a browser-DOM state, holding a count state and displaying a count card on the screen.
```

**README `# event` vs `useCapture` data object:** For page React functional components, the state README’s **`# event` section must list every key** you pass as **`useCapture`’s second argument** (the `data` object, e.g. `{ count }`). When any of those values change, `SubscriptionWithSetter.setData` **automatically** publishes an Observable event **named after that property** — you do not call `_publish` for those in the component. Example: `useCapture(..., { count }, ...)` ⇒ document `count` under `# event` so Flow and readers know it is a first-class, auto-emitted stream.

```ts
import React, { useState } from 'react';
import { SubscriptionWithSetter, Status, reactToState } from 'graphicode-utils';

// 1) Page State class — typed fields / methods; define and register before the component
class CountPageState extends SubscriptionWithSetter implements Status {
  private count: number;
  private _increase: () => void;
  private _decrease: () => void;

  public getCount(
    tag: { key: string; value: string }
  ) {
    this._publish('getCountSuccess', this.count, tag.value);
  }

  public increase(
    tag: { key: string; value: string }
  ) {
    this._increase();
  }

  public decrease(
    tag: { key: string; value: string }
  ) {
    this._decrease();
  }

  public on(eventName: string) {
    return this._subscribe(eventName);
  }
}

const countPageState = new CountPageState();
reactToState.setState('CountPage', countPageState);
export { countPageState };

// 2) Default-export React functional component — DOM + hooks; useCapture id must match setState above
export default () => {
  const [count, setCount] = useState(0);
  const increase = () => setCount(count + 1);
  const decrease = () => setCount(count - 1);
  reactToState.useCapture('CountPage', { count }, { _increase: increase, _decrease: decrease });
  return <div>{count}</div>;
};
```

Note 0:

In one page module (`index.tsx`), **put the `*PageState` class, `new` + `reactToState.setState`, and `export { xxxPageState }` above** the default-export React component. Then `xxxPageState` and its type annotations are always declared before any use (including other modules or Flow wiring), avoiding temporal-dead-zone / use-before-declaration problems.

Note 1: 

Page UI components should **only contain JSX DOM element descriptions and internally defined local states**. Use only official React hooks like `useState`, `useEffect`, `useCallback`, `useMemo`, and register them into the GraphiCode system using `reactToState.useCapture`. GraphiCode will control the internal state of this component.

**Do NOT use any non-React-official hooks** (e.g., Umi's `useLocation`, `useParams`, `useSearchParams`, or any routing hooks) inside page components. Route and BOM information should be obtained from the corresponding browser-BOM state class — let the Flow system connect them to the page, rather than calling hooks directly in the component.

Note 2:

Since page components are only instantiated globally once, there will be no multi-instance issues when accessing the internal state and methods of this component instance. For ordinary components, they may be instantiated multiple times due to multiple references or list rendering; therefore, **never use `reactToState.useCapture` to access the internal state and methods of non-page components**. Furthermore, ordinary components are always imported by page components, so there is no need to access their internal state.

Note 3:

Hook-bridged methods (set by `useCapture`) use underscore-prefixed private properties (e.g., `_increase`). The public method wraps them to accept `{key, value}` format from the Flow system.

Note 4:

For page states bridged with `reactToState.useCapture`, **keep the README `# event` list in sync with the `data` object’s keys**. Each key in `useCapture(id, { ... }, methods)` is watched; on change, `setData` **auto-publishes** an event whose name equals that key (e.g. `count` → `state.on('count')`). Treat these as **implicit events** — they are not manually `_publish`’d from the functional component. Manually published events (e.g. from class methods via `_publish`) still belong in `# event` as usual.

Note 5:

Methods that produce results must **not** return values directly. Instead, publish an event with the result via `this._publish(eventName, payload, tag.value)` — the `_publish` method auto-appends `-${tag}` suffix when tag is non-empty.
