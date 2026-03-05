# Local Storage State Management

Encapsulates browser `localStorage` / `sessionStorage` / `indexedDB` interfaces to provide reading, writing, and monitoring of persistent data changes. Below is an example of converting a State README into TypeScript code:

# read
## queryItem
> StorageKey
any
## queryAllKeys
StorageKeys

# write
## setItem
> StorageEntry
__null
## removeItem
> StorageKey
__null
## clear
__null

# event
## onStorageChange
any

# resides-in
browser-storage

# description
This state encapsulates the persistence logic of local storage:
1. **State Maintenance**: Synchronize the data snapshot in storage through `useState` to enable responsive read operations.
2. **Read Operations (read)**:
    - `queryItem`: Get the deserialized value from local storage according to the key name.
    - `queryAllKeys`: Return a list of all current key names in storage.
3. **Write Operations (write)**:
    - `setItem`: Serialize data and store it locally, while synchronously updating the local state.
    - `removeItem`: Delete a specified key-value pair.
    - `clear`: Clear all storage items.
4. **Events (event)**:
    - `onStorageChange`: Listen to `storage` events (usually triggered when other same-origin tabs modify the storage) to notify Flow to respond to data changes.

```ts
import { useState, useEffect, useCallback } from 'react';
import { reactToState, SubscriptionWithSetter, Status } from './state';

/**
 * Custom Hook: Manages localStorage interaction
 */
export function useLocalStorage(id: string) {
  const [snapshot, setSnapshot] = useState<Record<string, any>>({});

  // Write operation mapping: set data
  const setItem = useCallback(({ key, value }: any) => {
    localStorage.setItem(key, JSON.stringify(value));
    setSnapshot(prev => ({ ...prev, [key]: value }));
  }, []);

  // Listen for cross-tab changes
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key) {
        const newValue = e.newValue ? JSON.parse(e.newValue) : null;
        setSnapshot(prev => ({ ...prev, [e.key!]: newValue }));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Bridge synchronization
  reactToState.useCapture(id,
    { snapshot },
    { 
      setItem, 
      removeItem: (key: string) => localStorage.removeItem(key),
      clear: () => localStorage.clear() 
    }
  );

  return { snapshot, setItem };
}

/**
 * State Class
 */
class StorageState extends SubscriptionWithSetter implements Status {
  private snapshot: Record<string, any> = {};

  public setItem: (p: any) => void;
  public removeItem: (k: string) => void;
  public clear: () => void;

  public queryItem(params: { key: string }) {
    return this.snapshot[params.key] || JSON.parse(localStorage.getItem(params.key) || 'null');
  }

  public queryAllKeys() {
    return Object.keys(localStorage);
  }

  public onStorageChange(id: string, callback: (data: any) => void) {
    this._subscribe(id, 'snapshot', callback);
  }
}

const storageState = new StorageState();
reactToState.setState('StorageModel', storageState);
export { storageState };
```

Note 1:

Only within State corresponding to React functional components and hooks, **the callback of `this._subscribe` can receive two parameters**, namely the current value and the previous value.
