# Network State

Most frontend applications need to request dynamic data through APIs. Below is an example of converting a State README into TypeScript code using a direct `Subscription` class:

```md
# method
queryUserInfo: (id: number) -> void
queryAllUserInfo: () -> void
triggerRequest: (id: number) -> void

# event
loading: (cb: (loading: boolean) -> void) -> void
cache: (cb: (info: UserInfoMap) -> void) -> void
queryUserInfoSuccess: (cb: (info: UserInfo) -> void) -> void
queryAllUserInfoSuccess: (cb: (map: UserInfoMap) -> void) -> void

# resides-in
network

# description
This state encapsulates a user information asynchronous request and local caching flow.
1. **State Maintenance**: Internally maintains a `UserInfoMap` (e.g., `Record<number, UserInfo>`) to cache all fetched user information.
2. **Methods**:
    - `queryUserInfo`: Look up the corresponding `UserInfo` from the local cache and publish via `queryUserInfoSuccess` event.
    - `queryAllUserInfo`: Publish the current complete `UserInfoMap` cache object via `queryAllUserInfoSuccess` event.
    - `triggerRequest`: Receive a user ID and initiate an asynchronous API request to `/api/userInfo`.
3. **Events**:
    - `loading`: Notify subscribers of request loading state changes.
    - `cache`: Triggered when a request successfully returns with new data.
    - `queryUserInfoSuccess` / `queryAllUserInfoSuccess`: Result events for the corresponding query methods.
```

```ts
import { Subscription, Status } from 'graphicode-utils';
import from types...

class UserNetworkState extends Subscription implements Status {
  private cache: UserInfoMap = {};
  private loading: boolean = false;

  public override enable() {
    super.enable();
  }

  public override disable() {
    super.disable();
  }

  public triggerRequest(
    tag: { key: string; value: string },
    id: { key: string; value: number }
  ) {
    this.loading = true;
    this._publish('loading', true, tag.value);

    fetch(`/api/userInfo?id=${id.value}`)
      .then(res => res.json())
      .then((data: UserInfo) => {
        this.cache[data.id] = data;
        this.loading = false;
        this._publish('loading', false, tag.value);
        this._publish('cache', this.cache, tag.value);
      })
      .catch(() => {
        this.loading = false;
        this._publish('loading', false, tag.value);
      });
  }

  public queryUserInfo(
    tag: { key: string; value: string },
    id: { key: string; value: number }
  ) {
    this._publish('queryUserInfoSuccess', this.cache[id.value], tag.value);
  }

  public queryAllUserInfo(
    tag: { key: string; value: string }
  ) {
    this._publish('queryAllUserInfoSuccess', this.cache, tag.value);
  }

  public on(eventName: string) {
    return this._subscribe(eventName);
  }
}

const userNetworkState = new UserNetworkState();
export default userNetworkState;
```

Note 1:

Network request functions can use `fetch`, `axios`, or any HTTP library directly — no need for React hooks like `useRequest`.
