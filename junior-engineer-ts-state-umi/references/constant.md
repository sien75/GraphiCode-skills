# Constant State Management

Manage static business constants, configuration items, or hard-coded enumeration data that do not require React's reactive system for updates.

```md
# method
queryStatusList: () -> void
queryAppConfig: () -> void
queryErrorCode: (key: string) -> void

# event
config: (cb: (config: AppConfig) -> void) -> void
queryStatusListSuccess: (cb: (list: StatusList) -> void) -> void
queryAppConfigSuccess: (cb: (config: AppConfig) -> void) -> void
queryErrorCodeSuccess: (cb: (code: number) -> void) -> void

# resides-in
memory

# description
This state manages application-level constants and static configurations:
1. **State Maintenance**: Data is stored as private members within a standard TypeScript class.
2. **Methods**:
    - `queryStatusList`: Publish a pre-defined list of business statuses via `queryStatusListSuccess` event.
    - `queryAppConfig`: Publish the current global configuration object via `queryAppConfigSuccess` event.
    - `queryErrorCode`: Look up the numeric error code for a given string key and publish via `queryErrorCodeSuccess` event.
3. **Events**:
    - `config`: Notify Flow whenever the configuration is updated.
    - `queryStatusListSuccess` / `queryAppConfigSuccess` / `queryErrorCodeSuccess`: Result events for the corresponding query methods.
```

```ts
import { Subscription, Status } from 'graphicode-utils';

class ConstantState extends Subscription implements Status {
  private config: AppConfig = {
    version: '1.0.0',
    apiEndpoint: 'https://api.example.com',
  };

  private readonly statusList: StatusList = [
    { label: 'Pending', value: 0 },
    { label: 'Active', value: 1 },
    { label: 'Archived', value: 2 },
  ];

  public queryStatusList(
    tag: { key: string; value: string }
  ) {
    this._publish('queryStatusListSuccess', this.statusList, tag.value);
  }

  public queryAppConfig(
    tag: { key: string; value: string }
  ) {
    this._publish('queryAppConfigSuccess', this.config, tag.value);
  }

  public queryErrorCode(
    tag: { key: string; value: string },
    key: { key: string; value: string }
  ) {
    const codes: Record<string, number> = {
      'NOT_FOUND': 404,
      'UNAUTHORIZED': 401,
    };
    this._publish('queryErrorCodeSuccess', codes[key.value] || 500, tag.value);
  }

  public on(eventName: string) {
    return this._subscribe(eventName);
  }
}

const constantState = new ConstantState();
export default constantState;
```
