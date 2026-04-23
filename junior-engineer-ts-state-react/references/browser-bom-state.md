# Browser BOM State

Native browser BOM interfaces include window / screen / navigator, etc., which are encapsulated to provide system-level event listening and state reading.

```md
# method
queryWindowSize: () -> WindowSize
queryOnlineStatus: () -> boolean
scrollTo: (options: ScrollOptions) -> void
alert: (msg: string) -> void

# event
BOMState.size: WindowSize
BOMState.isOnline: boolean

# state
size: WindowSize
online: boolean

# resides-in
browser-BOM

# description
This state encapsulates common browser BOM operations and events:
1. **State Maintenance**: Real-time monitoring of window size changes and network connection status.
2. **Methods**:
    - `queryWindowSize`: Return the current window dimensions.
    - `queryOnlineStatus`: Return whether the browser is online.
    - `scrollTo`: Control page scrolling.
    - `alert`: Trigger a native alert.
3. **Events**:
    - `BOMState.size`: Notify Flow when the window size changes.
    - `BOMState.isOnline`: Notify Flow when the network status changes.
```

```ts
import State from '@/graphicode-utils/State';
import { guardEnabled, curried } from '@/graphicode-utils/state-decorators';

class BOMState extends State {
  private size: { width: number; height: number } = { width: 0, height: 0 };
  private online: boolean = true;

  private resizeHandler: (() => void) | null = null;
  private onlineHandler: (() => void) | null = null;
  private offlineHandler: (() => void) | null = null;

  public override enable() {
    this.size = { width: window.innerWidth, height: window.innerHeight };
    this.online = navigator.onLine;

    this.resizeHandler = () => {
      this.size = { width: window.innerWidth, height: window.innerHeight };
      // self-originated event — state change not triggered by a method call
      this._publish('BOMState.size', this.size);
    };
    this.onlineHandler = () => {
      this.online = true;
      this._publish('BOMState.isOnline', true);
    };
    this.offlineHandler = () => {
      this.online = false;
      this._publish('BOMState.isOnline', false);
    };

    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
    super.enable();
  }

  public override disable() {
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    if (this.onlineHandler) window.removeEventListener('online', this.onlineHandler);
    if (this.offlineHandler) window.removeEventListener('offline', this.offlineHandler);
    this.resizeHandler = null;
    this.onlineHandler = null;
    this.offlineHandler = null;
    super.disable();
  }

  @guardEnabled
  @curried
  public queryWindowSize() {
    return this.size;
  }

  @guardEnabled
  @curried
  public queryOnlineStatus() {
    return this.online;
  }

  @guardEnabled
  @curried
  public scrollTo(options: ScrollToOptions) {
    window.scrollTo(options);
  }

  @guardEnabled
  @curried
  public alert(msg: string) {
    window.alert(msg);
  }

  public getState() {
    return {
      size: this.size,
      online: this.online,
    };
  }
}

const bomState = new BOMState();
export default bomState;
```

Note 1:

Use `enable()` to initialize state and set up event listeners, `disable()` to tear them down. No React hooks — all browser APIs are used directly.

Note 2:

Every method is decorated with `@guardEnabled` (skips execution when state is disabled) and `@curried` (enables parameter collection from the Flow layer). Methods use normal parameter signatures — the `@curried` decorator handles the `{key, value}` conversion internally.

Note 3:

Events use `StateClassName.eventName` format (e.g., `BOMState.size`). These are self-originated events that the state publishes on its own — they are NOT triggered by method calls.

Note 4:

Methods return values (or throw errors) directly. They do **not** publish events. All result distribution (unicast, multicast, broadcast) is handled by the flow layer via `then`/`catch`.
