import { Observable } from 'rxjs';

type State = {
  on(eventName: string): Observable<any>;
  setTag(serialNumber: number, tag: string): void;
  [key: string]: any;
};

const curried = (fn: Function): (param: Record<string, any>) => any => {
  const collected: Record<string, any>[] = [];
  const step = (param: Record<string, any>): any => {
    collected.push(param);
    if (collected.length >= fn.length) {
      return fn(...collected);
    }
    return step;
  };
  return step;
};

export class Flow {
  private linkedMap = new Map<number, string>();
  private linkMap = new Map<number, number>();
  private curriedCache = new Map<object, Map<string, (param: Record<string, any>) => any>>();

  protected _connect(
    serialNumber: number,
    sourceState: State,
    sourceEvent: string,
    targetState: State,
    targetMethod: string,
    targetParam: string
  ) {
    const targetSerialNumber = this.linkMap.get(serialNumber);
    const storedTag = targetSerialNumber ? this.linkedMap.get(targetSerialNumber) : undefined;
    const eventName = storedTag ? `${sourceEvent}-${storedTag}` : sourceEvent;

    const method = targetState[targetMethod];
    if (typeof method !== 'function') return;

    sourceState.on(eventName).subscribe((payload: Record<string, any>) => {
      if (!this.curriedCache.has(targetState)) {
        this.curriedCache.set(targetState, new Map());
      }
      const methodCache = this.curriedCache.get(targetState)!;

      if (!methodCache.has(targetMethod)) {
        methodCache.set(targetMethod, curried(method.bind(targetState)));
      }

      const step = methodCache.get(targetMethod)!;
      const result = step({ [targetParam]: payload });

      if (typeof result !== 'function') {
        methodCache.delete(targetMethod);
      } else {
        methodCache.set(targetMethod, result);
      }
    });
  }

  protected _linked(serialNumber: number, sourceState: State) {
    const tag = `tag-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    this.linkedMap.set(serialNumber, tag);
    sourceState.setTag(serialNumber, tag);
  }

  protected _link(serialNumber: number, targetSerialNumber: number) {
    this.linkMap.set(serialNumber, targetSerialNumber);
  }
}
