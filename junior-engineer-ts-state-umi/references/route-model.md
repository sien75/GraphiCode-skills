# Routing State Management

In frontend applications, routing management is a common requirement. It's necessary to encapsulate routing operations and location information listening to map URL state to business state. Below is a specific example of converting a State README into TypeScript code:

# read
## queryLocation
Location
## queryParams
Params
## querySearchParams
SearchParams

# write
## push
> NavigatePath
__null
## replace
> NavigatePath
__null
## back
__null

# event
## onLocationChange
Location

# resides-in
browser-BOM

# description
This state manages the application's routing information, allowing the Flow to drive page navigation or listen to URL changes.
1. **State Maintenance**: Internally synchronizes the current page's Pathname, Search parameters, and dynamic routing parameters in real-time.
2. **Read Operations (read)**:
    - `queryLocation`: Get the current location object (containing pathname, search, hash, etc.).
    - `queryParams`: Get dynamic routing parameters (e.g., id in /user/:id).
    - `querySearchParams`: Get URL Query parameters.
3. **Write Operations (write)**:
    - `push`: Perform a standard page navigation.
    - `replace`: Perform a page navigation that replaces the history entry.
    - `back`: Go back to the previous page.
4. **Events (event)**:
    - `onLocationChange`: Notify Flow whenever the URL changes to execute the corresponding logic.

```ts
import { useLocation, useNavigate, useParams, useSearchParams } from 'umi';
import { useEffect } from 'react';
import { reactToState, SubscriptionWithSetter, Status } from './state';

/**
 * Custom Hook: Listen to and control routing through Umi (React-Router 6) Hooks
 */
export function useRouteState(id: string) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Bridge synchronization: Expose Umi routing state and operation methods to GraphiCode
  reactToState.useCapture(id,
    { location, params, searchParams }, // data maps to read
    { 
      push: (path: any) => navigate(path), 
      replace: (path: any) => navigate(path, { replace: true }),
      back: () => navigate(-1)
    } // methods map to write
  );

  return { location, params, searchParams };
}

/**
 * State Class: Interface for the Flow system to call
 */
class RouteState extends SubscriptionWithSetter implements Status {
  private location: any;
  private params: any;
  private searchParams: any;

  // Methods are dynamically populated by useCapture
  public push: (path: any) => void;
  public replace: (path: any) => void;
  public back: () => void;

  public queryLocation() { return this.location; }
  public queryParams() { return this.params; }
  public querySearchParams() { return this.searchParams; }

  public onLocationChange(id: string, callback: (loc: any) => void) {
    this._subscribe(id, 'location', callback);
  }
}

const routerState = new RouteState();
reactToState.setState('RouteModel', routerState);
export { routerState };
```

Note 1:

Only within State corresponding to React functional components and hooks, **the callback of `this._subscribe` can receive two parameters**, namely the current value and the previous value.
