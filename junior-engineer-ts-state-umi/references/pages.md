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

```ts
import React, { useState } from 'react';
import { SubscriptionWithSetter, Status, reactToState } from 'graphicode-utils';

// this function is used to render React DOM
export default () => {
  const [count, setCount] = useState(0);
  const increase = () => setCount(count + 1);
  const decrease = () => setCount(count - 1);
  reactToState.useCapture('CountPage', { count }, { _increase: increase, _decrease: decrease });
  return <div>{count}</div>;
}

// this class is corresponded to page functional component, and is used as a State for GraphiCode
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
```

Note 1: 

Page UI components should **only contain JSX DOM element descriptions and internally defined local states**. Use only official React hooks like `useState`, `useEffect`, `useCallback`, `useMemo`, and register them into the GraphiCode system using `reactToState.useCapture`. GraphiCode will control the internal state of this component.

Note 2:

Since page components are only instantiated globally once, there will be no multi-instance issues when accessing the internal state and methods of this component instance. For ordinary components, they may be instantiated multiple times due to multiple references or list rendering; therefore, **never use `reactToState.useCapture` to access the internal state and methods of non-page components**. Furthermore, ordinary components are always imported by page components, so there is no need to access their internal state.

Note 3:

Hook-bridged methods (set by `useCapture`) use underscore-prefixed private properties (e.g., `_increase`). The public method wraps them to accept `{key, value}` format from the Flow system.

Note 4:

For `SubscriptionWithSetter` states, property change events are auto-published by `setData` using the **property name** as the event name (e.g., property `count` → event `count`). The Flow listens via `state.on('count')`.

Note 5:

Methods that produce results must **not** return values directly. Instead, publish an event with the result via `this._publish(eventName, payload, tag.value)` — the `_publish` method auto-appends `-${tag}` suffix when tag is non-empty.
