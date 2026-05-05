# Routing State

In frontend applications, routing management is a common requirement. The routing library provides a `history` API for direct use in state classes.

```md
# method
queryLocation: () -> Location
queryParams: () -> Record<string, string>
push: (path: NavigatePath) -> void
replace: (path: NavigatePath) -> void
back: () -> void

# event
RouteState.location: Location

# state
location: Location

# resides-in
browser-BOM

# description
This state manages the application's routing information, allowing the Flow to drive page navigation or listen to URL changes.
1. **State Maintenance**: Internally synchronizes the current page's location by listening to the routing library.
2. **Methods**:
    - `queryLocation`: Return the current location object.
    - `queryParams`: Parse and return URL search parameters.
    - `push`: Perform a standard page navigation.
    - `replace`: Perform a page navigation that replaces the history entry.
    - `back`: Go back to the previous page.
3. **Events**:
    - `RouteState.location`: Notify Flow whenever the URL changes.
```

```ts
import State from '@/graphicode-utils/State';
import { guardEnabled, curried } from '@/graphicode-utils/state-decorators';
// Import routing API based on the project's routing library
// e.g., import { history } from 'umi'; or import { createBrowserHistory } from 'history';

class RouteState extends State {
  private location: any = {};
  private unlisten: (() => void) | null = null;

  public override enable() {
    this.location = history.location;
    this.unlisten = history.listen(({ location }) => {
      this.location = location;
      this._publish('RouteState.location', location);
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

  @guardEnabled
  @curried
  public queryLocation() {
    return this.location;
  }

  @guardEnabled
  @curried
  public queryParams() {
    return Object.fromEntries(new URLSearchParams(this.location?.search || ''));
  }

  @guardEnabled
  @curried
  public push(path: string) {
    history.push(path);
  }

  @guardEnabled
  @curried
  public replace(path: string) {
    history.replace(path);
  }

  @guardEnabled
  @curried
  public back() {
    history.back();
  }

  public getState() {
    return {
      location: this.location,
    };
  }
}

const routeState = new RouteState();
export default routeState;
```

Note 1:

Import the routing API based on the project's routing library. The routing API should be a non-hook API available anywhere, not just inside React components. Listen in `enable()`, unlisten in `disable()`.

Note 2:

Every method is decorated with `@guardEnabled` (skips execution when state is disabled) and `@curried` (enables parameter collection from the Flow layer). Methods use normal parameter signatures — the `@curried` decorator handles the `{key, value}` conversion internally.

Note 3:

Methods return values (or throw errors) directly. They do **not** publish events. All result distribution is handled by the flow layer.
