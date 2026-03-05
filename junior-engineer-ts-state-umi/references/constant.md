# Constant State Management

Manage static business constants, configuration items, or hard-coded enumeration data that do not require React's reactive system for updates.

# read
## queryStatusList
StatusList

## queryAppConfig
AppConfig

## queryErrorCode
> string
number

# event
## onConfigChange
AppConfig

# resides-in
memory

# description
This state manages application-level constants and static configurations:
1. **State Maintenance**: Data is stored as private members within a standard TypeScript class.
2. **Read Operations (read)**:
    - `queryStatusList`: Return a pre-defined list of business statuses.
    - `queryAppConfig`: Return the current global configuration object.
    - `queryErrorCode`: Look up the numeric error code for a given string key.
3. **Events (event)**:
    - `onConfigChange`: Notify Flow whenever the configuration is updated.

```ts
import { Subscription, Status } from 'graphicode-utils';

/**
 * State Class: Managed as a pure TypeScript instance
 */
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

  public queryStatusList(): StatusList {
    return this.statusList;
  }

  public queryAppConfig(): AppConfig {
    return this.config;
  }

  public queryErrorCode(params: { key: string }): number {
    const codes: Record<string, number> = {
      'NOT_FOUND': 404,
      'UNAUTHORIZED': 401,
    };
    return codes[params.key] || 500;
  }

  public onConfigChange(id: string, callback: (config: AppConfig) => void): void {
    this._subscribe(id, 'config', callback);
  }
}

const constantState = new ConstantState();
export default constantState;
```
