import Subscription from "../Subscription";

type Callback = (...args: any[]) => void;

class Store extends Subscription {
  private stateInstances: Map<string, Subscription> = new Map();
  private flowStatus: Map<string, boolean> = new Map();

  // --- State management ---

  instantiateState(stateClass: any, id?: string): string {
    const resolvedId = id ?? crypto.randomUUID();
    if (!this.stateInstances.has(resolvedId)) {
      const instance = new stateClass();
      this.stateInstances.set(resolvedId, instance);
      this._publish("stateCreated", resolvedId, instance);
    }
    return resolvedId;
  }

  deleteState(id: string): void {
    const instance = this.stateInstances.get(id);
    if (instance) {
      this.stateInstances.delete(id);
      this._publish("stateDestroyed", id, null);
    }
  }

  getStateInstance(id: string): Subscription | undefined {
    return this.stateInstances.get(id);
  }

  getAllStateInstances(): Map<string, Subscription> {
    return new Map(this.stateInstances);
  }

  onStateCreated(callback: Callback): () => void {
    return this._subscribe("stateCreated", callback);
  }

  onStateDestroyed(callback: Callback): () => void {
    return this._subscribe("stateDestroyed", callback);
  }

  // --- Flow management ---

  enableFlow(id: string): void {
    if (this.flowStatus.has(id)) {
      const prev = this.flowStatus.get(id);
      if (!prev) {
        this.flowStatus.set(id, true);
        this._publish("flowStatusChanged", id, true);
      }
    }
  }

  disableFlow(id: string): void {
    if (this.flowStatus.has(id)) {
      const prev = this.flowStatus.get(id);
      if (prev) {
        this.flowStatus.set(id, false);
        this._publish("flowStatusChanged", id, false);
      }
    }
  }

  isFlowEnabled(id: string): boolean {
    return this.flowStatus.get(id) ?? false;
  }

  getAllFlowStates(): Map<string, boolean> {
    return new Map(this.flowStatus);
  }

  onFlowStatusChanged(callback: Callback): () => void {
    return this._subscribe("flowStatusChanged", callback);
  }
}

export default Store;
