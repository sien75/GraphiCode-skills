import { Subscription, Status } from "graphicode-utils";

class Store extends Subscription implements Status {
  enabled: boolean = false;
  private data: Map<string, any> = new Map();

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  set(key: string, value: any) {
    this.data.set(key, value);
  }

  get(key: string): any {
    return this.data.get(key);
  }

  delete(key: string) {
    this.data.delete(key);
  }
}

const store = new Store();

export default store;
