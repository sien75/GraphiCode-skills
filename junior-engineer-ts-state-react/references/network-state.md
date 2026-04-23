# Network State

Most frontend applications need to request dynamic data through APIs. Below is an example of converting a State README into TypeScript code using the `State` base class:

```md
# method
queryUserInfo: (id: number) -> UserInfo
queryAllUserInfo: () -> UserInfoMap
triggerRequest: (id: number) -> void

# event
NetworkState.loading: boolean
NetworkState.cache: UserInfoMap

# state
cache: UserInfoMap
loading: boolean

# resides-in
network

# description
This state encapsulates a user information asynchronous request and local caching flow.
1. **State Maintenance**: Internally maintains a `UserInfoMap` (e.g., `Record<number, UserInfo>`) to cache all fetched user information.
2. **Methods**:
    - `queryUserInfo`: Look up the corresponding `UserInfo` from the local cache and return it.
    - `queryAllUserInfo`: Return the current complete `UserInfoMap` cache object.
    - `triggerRequest`: Receive a user ID and initiate an asynchronous API request to `/api/userInfo`.
3. **Events**:
    - `NetworkState.loading`: Notify subscribers of request loading state changes.
    - `NetworkState.cache`: Triggered when a request successfully returns with new data.
```

```ts
import State from '@/graphicode-utils/State';
import { guardEnabled, curried } from '@/graphicode-utils/state-decorators';
// import types...

class NetworkState extends State {
  private cache: UserInfoMap = {};
  private loading: boolean = false;

  @guardEnabled
  @curried
  public triggerRequest(id: number) {
    this.loading = true;
    this._publish('NetworkState.loading', true);

    fetch(`/api/userInfo?id=${id}`)
      .then(res => res.json())
      .then((data: UserInfo) => {
        this.cache[data.id] = data;
        this.loading = false;
        this._publish('NetworkState.loading', false);
        this._publish('NetworkState.cache', this.cache);
      })
      .catch(() => {
        this.loading = false;
        this._publish('NetworkState.loading', false);
      });
  }

  @guardEnabled
  @curried
  public queryUserInfo(id: number) {
    return this.cache[id];
  }

  @guardEnabled
  @curried
  public queryAllUserInfo() {
    return this.cache;
  }

  public getState() {
    return {
      cache: this.cache,
      loading: this.loading,
    };
  }
}

const networkState = new NetworkState();
export default networkState;
```

Note 1:

Network request functions can use `fetch`, `axios`, or any HTTP library directly — no need for React hooks like `useRequest`.

Note 2:

Every method is decorated with `@guardEnabled` (skips execution when state is disabled) and `@curried` (enables parameter collection from the Flow layer). Methods use normal parameter signatures — the `@curried` decorator handles the `{key, value}` conversion internally.

Note 3:

Query methods return values directly. The flow layer handles result distribution (unicast, multicast, broadcast) via `then`/`catch`. Self-originated events (like `NetworkState.loading`, `NetworkState.cache`) are published via `this._publish()` — these represent state changes the state initiates on its own, not method return values.
