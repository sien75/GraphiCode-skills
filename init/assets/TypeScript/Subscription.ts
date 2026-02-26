type Callback = (...args: any[]) => void;

class Subscription {
  private _subscriptions: Map<string, Set<Callback>> = new Map();
  private _enabledChangeCallbacks: Set<(enabled: boolean) => void> = new Set();
  private _enabled = false;

  public isEnabled(): boolean {
    return this._enabled;
  }

  public enable(): void {
    this._enabled = true;
    this._enabledChangeCallbacks.forEach(cb => cb(true));
  }

  public disable(): void {
    this._enabled = false;
    this._enabledChangeCallbacks.forEach(cb => cb(false));
  }

  public onEnabledChange(callback: (enabled: boolean) => void): void {
    this._enabledChangeCallbacks.add(callback);
  }

  protected _subscribe(id: string, callback: Callback): () => void {
    if (!this._subscriptions.has(id)) {
      this._subscriptions.set(id, new Set());
    }
    this._subscriptions.get(id)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this._subscriptions.get(id);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this._subscriptions.delete(id);
        }
      }
    };
  }

  protected _publish(id: string, ...args: any[]): void {
    if (!this._enabled) return;
    const callbacks = this._subscriptions.get(id);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(...args);
      }
    }
  }
}

export default Subscription;
