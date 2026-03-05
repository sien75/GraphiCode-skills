import { useEffect } from 'react';
import Subscription from './Subscription';

export class SubscriptionWithSetter extends Subscription {
  public setData(data: any): void {
    const changedKeys = this.findChangedKeys(data);
    for (const key of changedKeys) {
      this._publish(key, data[key], this[key]);
    }
    for (const key of Object.keys(data)) {
      this[key] = data;
    }
  }

  private findChangedKeys(data: any): string[] {
    const changedKeys: string[] = [];
    for (const key in data) {
      if (data[key] !== this[key]) {
        changedKeys.push(key);
      }
    }
    return changedKeys;
  }

  public setMethods(methods: any): void {
    for (const key of Object.keys(methods)) {
      this[key] = methods[key];
    }
  }
}

/**
 * ReactToState
 * A bridge to expose React component internal state/methods to external Flow/State instances.
 */
class ReactToState {
  private _registry = new Map<string, SubscriptionWithSetter>();

  constructor() {
    this.useCapture = this.useCapture.bind(this);
    this.get = this.get.bind(this);
  }

  public setState(id: string, state: SubscriptionWithSetter): void {
    this._registry.set(id, state);
  }

  /**
   * Hook: Use this inside a React functional component or another hook.
   * @param id Unique identifier (usually provided by the flow system)
   * @param data The data (state) to expose
   * @param methods The methods (functions) to expose
   */
  public useCapture(id: string, data: any, methods: any) {
    const state = this._registry.get(id)!;

    useEffect(() => {
      state.setData(data);
    }, [id, ...data]);

    useEffect(() => {
      state.setMethods(methods);
    }, [id, ...methods]);
  }

  /**
   * Non-React Method: Get the State instance for a specific ID.
   * If it doesn't exist, it will be generated.
   */
  public get(id: string): SubscriptionWithSetter {
    let state = this._registry.get(id);
    if (!state) {
      state = new SubscriptionWithSetter();
    }
    return state;
  }
}

const reactToState = new ReactToState();

export default reactToState;

