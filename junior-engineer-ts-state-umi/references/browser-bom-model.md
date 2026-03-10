# Browser BOM State Management

Native browser BOM interfaces include window / screen / navigator, etc., which are encapsulated to provide system-level event listening and state reading. Below is an example of converting a State README into TypeScript code:

# read
## queryWindowSize
WindowSize

## queryOnlineStatus
boolean

# write
## scrollTo
> ScrollOptions
__null

## alert
> string
__null

# event
## onResize
WindowSize

## onOnlineStatusChange
boolean

# resides-in
browser-BOM

# description
This state encapsulates common browser BOM operations and events:
1. **State Maintenance**: Real-time monitoring of window size changes and network connection status (Online/Offline).
2. **Read Operations (read)**:
    - `queryWindowSize`: Get the width and height of the current window.
    - `queryOnlineStatus`: Get whether the current browser is online.
3. **Write Operations (write)**:
    - `scrollTo`: Control page scrolling.
    - `alert`: Trigger a native alert.
4. **Events (event)**:
    - `onResize`: Notify Flow when the window size changes.
    - `onOnlineStatusChange`: Notify Flow when the network status changes.

```ts
import { useState, useEffect } from 'react';
import { reactToState, SubscriptionWithSetter, Status } from './state';

/**
 * Custom Hook: Manages BOM events and state
 */
export function useBrowserBOM(id: string) {
  const [size, setSize] = useState<WindowSize>({ width: window.innerWidth, height: window.innerHeight });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleResize = () => {
      const newSize = { width: window.innerWidth, height: window.innerHeight };
      setSize(newSize);
    };
    const handleStatus = () => {
      const status = navigator.onLine;
      setIsOnline(status);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Bridge synchronization
  reactToState.useCapture(id,
    { size, isOnline },
    { 
      scrollTo: (options: any) => window.scrollTo(options),
      alert: (msg: string) => window.alert(msg)
    }
  );

  return { size, isOnline };
}

/**
 * State Class
 */
class BOMState extends SubscriptionWithSetter implements Status {
  private size: WindowSize;
  private isOnline: boolean;

  public scrollTo: (opt: any) => void;
  public alert: (msg: string) => void;

  public queryWindowSize() { return this.size; }
  public queryOnlineStatus() { return this.isOnline; }

  public onResize(id: string, callback: (s: WindowSize) => void) {
    this._subscribe(id, 'size', callback);
  }

  public onOnlineStatusChange(id: string, callback: (o: boolean) => void) {
    this._subscribe(id, 'isOnline', callback);
  }
}

const bomState = new BOMState();
reactToState.setState('BOMModel', bomState);
export { bomState };
```

Note 1:

Only within State corresponding to React functional components and hooks, **the callback of `this._subscribe` can receive two parameters**, namely the current value and the previous value.

Note 2:

To import assets such as images, import them from `src/assets`. The imported value is a string representing the asset's URL.

Note 3:

After adding a page, you must update the routing information in .umirc.ts.
