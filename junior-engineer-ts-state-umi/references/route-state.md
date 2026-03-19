# Routing State

In frontend applications, routing management is a common requirement. In Umi, the `history` API is available as a non-hook import for direct use in state classes.

```md
# method
queryLocation: () -> void
queryParams: () -> void
push: (path: NavigatePath) -> void
replace: (path: NavigatePath) -> void
back: () -> void

# event
location: (cb: (loc: Location) -> void) -> void
queryLocationSuccess: (cb: (loc: Location) -> void) -> void
queryParamsSuccess: (cb: (params: Record<string, string>) -> void) -> void

# resides-in
browser-BOM

# description
This state manages the application's routing information, allowing the Flow to drive page navigation or listen to URL changes.
1. **State Maintenance**: Internally synchronizes the current page's location by listening to `history`.
2. **Methods**:
    - `queryLocation`: Publish the current location object via `queryLocationSuccess` event.
    - `queryParams`: Parse and publish URL search parameters via `queryParamsSuccess` event.
    - `push`: Perform a standard page navigation.
    - `replace`: Perform a page navigation that replaces the history entry.
    - `back`: Go back to the previous page.
3. **Events**:
    - `location`: Notify Flow whenever the URL changes.
```

```ts
import { Subscription, Status } from 'graphicode-utils';
import { history } from 'umi';

class RouteState extends Subscription implements Status {
  private location: any;
  private unlisten: (() => void) | null = null;

  public override enable() {
    this.location = history.location;
    this.unlisten = history.listen(({ location }) => {
      this.location = location;
      this._publish('location', location);
    });
    super.enable();
  }

  public override disable() {
    if (this.unlisten) {
      this.unlisten();
      this.unlisten = null;
    }
    super.disable();
  }

  public queryLocation(tag: { key: string; value: string }) {
    this._publish('queryLocationSuccess', this.location, tag.value);
  }

  public queryParams(tag: { key: string; value: string }) {
    const params = Object.fromEntries(new URLSearchParams(this.location?.search || ''));
    this._publish('queryParamsSuccess', params, tag.value);
  }

  public push(
    tag: { key: string; value: string },
    path: { key: string; value: any }
  ) {
    history.push(path.value);
  }

  public replace(
    tag: { key: string; value: string },
    path: { key: string; value: any }
  ) {
    history.replace(path.value);
  }

  public back(tag: { key: string; value: string }) {
    history.back();
  }

  public on(eventName: string) {
    return this._subscribe(eventName);
  }
}

const routeState = new RouteState();
export default routeState;
```

Note 1:

Use `history` imported from `'umi'` — this is a non-hook API available anywhere, not just inside React components. Listen in `enable()`, unlisten in `disable()`.
