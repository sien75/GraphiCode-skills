# Browser BOM State

Native browser BOM interfaces include window / screen / navigator, etc., which are encapsulated to provide system-level event listening and state reading.

```md
# method
queryWindowSize: () -> void
queryOnlineStatus: () -> void
scrollTo: (options: ScrollOptions) -> void
alert: (msg: string) -> void

# event
size: (cb: (size: WindowSize) -> void) -> void
isOnline: (cb: (status: boolean) -> void) -> void
queryWindowSizeSuccess: (cb: (size: WindowSize) -> void) -> void
queryOnlineStatusSuccess: (cb: (status: boolean) -> void) -> void

# resides-in
browser-BOM

# description
This state encapsulates common browser BOM operations and events:
1. **State Maintenance**: Real-time monitoring of window size changes and network connection status.
2. **Methods**:
    - `queryWindowSize`: Publish the current window dimensions via `queryWindowSizeSuccess` event.
    - `queryOnlineStatus`: Publish whether the browser is online via `queryOnlineStatusSuccess` event.
    - `scrollTo`: Control page scrolling.
    - `alert`: Trigger a native alert.
3. **Events**:
    - `size`: Notify Flow when the window size changes.
    - `isOnline`: Notify Flow when the network status changes.
```

```ts
import { Subscription, Status } from 'graphicode-utils';

class BOMState extends Subscription implements Status {
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
      this._publish('size', this.size);
    };
    this.onlineHandler = () => {
      this.online = true;
      this._publish('isOnline', true);
    };
    this.offlineHandler = () => {
      this.online = false;
      this._publish('isOnline', false);
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

  public queryWindowSize(
    tag: { key: string; value: string }
  ) {
    this._publish('queryWindowSizeSuccess', this.size, tag.value);
  }

  public queryOnlineStatus(
    tag: { key: string; value: string }
  ) {
    this._publish('queryOnlineStatusSuccess', this.online, tag.value);
  }

  public scrollTo(
    tag: { key: string; value: string },
    options: { key: string; value: any }
  ) {
    window.scrollTo(options.value);
  }

  public alert(
    tag: { key: string; value: string },
    msg: { key: string; value: string }
  ) {
    window.alert(msg.value);
  }

  public on(eventName: string) {
    return this._subscribe(eventName);
  }
}

const bomState = new BOMState();
export default bomState;
```

Note 1:

Use `enable()` to initialize state and set up event listeners, `disable()` to tear them down. No React hooks — all browser APIs are used directly.

Note 2:

To import assets such as images, import them from `src/assets`. The imported value is a string representing the asset's URL.

Note 3:

After adding a page, you must update the routing information in .umirc.ts.
