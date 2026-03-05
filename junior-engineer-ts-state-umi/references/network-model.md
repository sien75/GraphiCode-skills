# Network State Model

Most frontend applications need to request dynamic data through APIs. In Umi applications, `useRequest` can be used to achieve this. Below is an example of converting a State README into TypeScript code:

```md
# read
## queryUserInfo
> number
UserInfo
## queryAllUserInfo
UserInfoMap

# write
## triggerRequest
number

# event
## onLoadingChange
boolean
## onUserInfoChange
UserInfo

# resides-in
network

# description
This state encapsulates a user information asynchronous request and local caching flow based on `useRequest`.
1. **State Maintenance**: Internally maintains a `UserInfoMap` (e.g., `Record<number, UserInfo>`) to cache all fetched user information.
2. **Read Operations (read)**:
    - `queryUserInfo`: Look up and return the corresponding `UserInfo` from the local cache based on the passed `number` ID.
    - `queryAllUserInfo`: Directly return the current complete `UserInfoMap` cache object.
3. **Write Operations (write)**:
    - `triggerRequest`: Receive a user ID and call the `run` method of `useRequest` to initiate an asynchronous API request. The request path is `/api/userInfo` with the parameter `id`.
4. **Events (event)**:
    - `onLoadingChange`: Notify subscribers that `loading` becomes true when a request is triggered, and false when the request ends.
    - `onUserInfoChange`: Triggered when a request successfully returns. it publishes the latest `UserInfoMap` as a parameter to notify subsequent nodes in the Flow that new data has arrived.
5. **Core Logic**: Utilize the `onSuccess` callback of `useRequest` to update the local `UserInfoMap` and trigger the `onNewUserInfoRes` event.
```

```ts
// This is a pseudo-code reference based on the new definition requirements (Custom Hook form)
import { useRequest } from 'umi';
import { useState } from 'react';
import { reactToState, SubscriptionWithSetter, Status } from './state';
import from types...

export function useUserInfoNetwork() {
  const [cache, setCache] = useState<UserInfoMap>({});

  const { run, loading } = useRequest(fetchUserApi, {
    manual: true,
    onSuccess: (data: UserInfo) => {
      // 1. Update local cache
      setCache(prev => ({ ...prev, [data.id]: data }));
    }
  });

  // Utilize the bridge Hook to synchronize internal data to the GraphiCode State instance
  reactToState.useCapture('useUserInfoNetwork', 
    { cache, loading },   // Expose state: for queryAllUserInfo/queryUserInfo use
    { triggerRequest: run }      // Expose method: for triggerRequest use
  );

  return { cache, run };
}

class UserNetworkState extends SubscriptionWithSetter implements Status {
  private cache: UserInfoMap = {};
  private loading: boolean = false;

  public triggerRequest: (id: number) => any;

  public queryUserInfo(params: { id: number }): UserInfo {
    return this.cache[params.id];
  }

  public queryAllUserInfo(): UserInfoMap {
    return this.cache;
  }

  public onLoadingChange(id: string, callback: (loading: boolean) => void) {
    this._subscribe(id, 'loading', callback);
  }

  public onUserInfoChange(id: string, callback: (data: UserInfoMap, prevData: UserInfoMap) => void) {
    this._subscribe(id, 'cache', callback);
  }
}

const userNetworkState = new UserNetworkState();
reactToState.setState('useUserInfoNetwork', userNetworkState);
export { userNetworkState };
```

Note 1:

Only within State corresponding to React functional components and hooks, **the callback of `this._subscribe` can receive two parameters**, namely the current value and the previous value.
