# Pages

Since React functional components are not classes, to adapt to the GraphiCode development paradigm, internal states need to be exported via hooks and captured by a new State instance. See the example below:

```md
# read
## getCount
number

# write
## increase
## decrease

# event
## onCountChange
number

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
  reactToState.useCapture('CountPage', { count }, { increase, decrease });
  return <div>{count}</div>;
}

// this class is corresponded to page functional component, and is used as a State for GraphiCode
class CountPageState extends SubscriptionWithSetter implements Status {
  private count: number;

  public increase: (count: number) => void;
  public decrease: (count: number) => void;

  public getCount(): number {
    return this.count;
  }
  
  public onCountChange(callback: (count: number) => void): void {
    this._subscribe('count', callback);
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

Only within State corresponding to React functional components and hooks, **the callback of `this._subscribe` can receive two parameters**, namely the current value and the previous value.
