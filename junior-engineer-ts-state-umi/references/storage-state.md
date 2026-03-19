# Local Storage State

Encapsulates browser `localStorage` / `sessionStorage` / `indexedDB` interfaces to provide reading, writing, and monitoring of persistent data changes.

```md
# method
queryItem: (key: StorageKey) -> void
queryAllKeys: () -> void
setItem: (entry: StorageEntry) -> void
removeItem: (key: StorageKey) -> void
clear: () -> void

# event
storageChange: (cb: (data: any) -> void) -> void
queryItemSuccess: (cb: (value: any) -> void) -> void
queryAllKeysSuccess: (cb: (keys: StorageKeys) -> void) -> void

# resides-in
browser-storage

# description
This state encapsulates the persistence logic of local storage:
1. **State Maintenance**: Listens to cross-tab `storage` events.
2. **Methods**:
    - `queryItem`: Get the deserialized value from local storage and publish via `queryItemSuccess` event.
    - `queryAllKeys`: Publish a list of all current key names via `queryAllKeysSuccess` event.
    - `setItem`: Serialize data and store it locally.
    - `removeItem`: Delete a specified key-value pair.
    - `clear`: Clear all storage items.
3. **Events**:
    - `storageChange`: Triggered when other same-origin tabs modify the storage.
```

```ts
import { Subscription, Status } from 'graphicode-utils';

class StorageState extends Subscription implements Status {
  private handler: ((e: StorageEvent) => void) | null = null;

  public override enable() {
    this.handler = (e: StorageEvent) => {
      if (e.key) {
        const newValue = e.newValue ? JSON.parse(e.newValue) : null;
        this._publish('storageChange', { key: e.key, value: newValue });
      }
    };
    window.addEventListener('storage', this.handler);
    super.enable();
  }

  public override disable() {
    if (this.handler) {
      window.removeEventListener('storage', this.handler);
      this.handler = null;
    }
    super.disable();
  }

  public queryItem(
    tag: { key: string; value: string },
    key: { key: string; value: string }
  ) {
    const raw = localStorage.getItem(key.value);
    const value = raw ? JSON.parse(raw) : null;
    this._publish('queryItemSuccess', value, tag.value);
  }

  public queryAllKeys(
    tag: { key: string; value: string }
  ) {
    this._publish('queryAllKeysSuccess', Object.keys(localStorage), tag.value);
  }

  public setItem(
    tag: { key: string; value: string },
    entry: { key: string; value: { key: string; data: any } }
  ) {
    localStorage.setItem(entry.value.key, JSON.stringify(entry.value.data));
  }

  public removeItem(
    tag: { key: string; value: string },
    key: { key: string; value: string }
  ) {
    localStorage.removeItem(key.value);
  }

  public clear(
    tag: { key: string; value: string }
  ) {
    localStorage.clear();
  }

  public on(eventName: string) {
    return this._subscribe(eventName);
  }
}

const storageState = new StorageState();
export default storageState;
```

Note 1:

Use `enable()` to set up event listeners and `disable()` to tear them down. No React hooks needed — all browser APIs are used directly.
