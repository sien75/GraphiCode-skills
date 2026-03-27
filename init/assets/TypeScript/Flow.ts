import { Observable, map } from 'rxjs';

type State = {
  on(eventName: string): Observable<any>;
  [key: string]: any;
};

const curried = (
  fn: (...args: Record<string, any>[]) => any,
  serialNumber: number,
  logs: Map<number, any[]>
): (param: Record<string, any>) => any => {
  const collected: Record<string, any>[] = [];
  const step = (param: Record<string, any>): any => {
    collected.push(param);
    if (collected.length >= fn.length) {
      const output = fn(...collected);
      const records = logs.get(serialNumber) ?? [];
      records.push({ input: [...collected], output });
      logs.set(serialNumber, records);
      return output;
    }
    return step;
  };
  return step;
};

export class Flow {
  private curriedCache = new Map<object, Map<string, (param: Record<string, any>) => any>>();
  private logs = new Map<number, any[]>();

  protected _connect(
    serialNumber: number,
    sourceState: State,
    sourceEvent: string,
    targetState: State,
    targetMethod: string,
    targetParam: string,
    algorithms: ((input: any) => any)[] = [],
    tag?: { linked?: string; linkTo?: string }
  ) {
    const eventName = tag?.linkTo ? `${sourceEvent}-${tag.linkTo}` : sourceEvent;

    const method = targetState[targetMethod];
    if (typeof method !== 'function') return;

    const mappedAlgorithms: any = algorithms.map(algo => map((payload: any) => algo({ logs: this.logs, payload })));

    (sourceState.on(eventName).pipe as any)(
      ...mappedAlgorithms
    ).subscribe((payload: any) => {
      if (!this.curriedCache.has(targetState)) {
        this.curriedCache.set(targetState, new Map());
      }
      const methodCache = this.curriedCache.get(targetState)!;

      if (!methodCache.has(targetMethod)) {
        const initial = curried(method.bind(targetState), serialNumber, this.logs);
        const tagValue = tag?.linked ?? '';
        const afterTag = initial({ key: '__tag', value: tagValue });
        methodCache.set(targetMethod, afterTag);
      }

      const step = methodCache.get(targetMethod)!;
      const result = typeof step === 'function' ? step({ key: targetParam, value: payload }) : step;

      if (typeof result !== 'function') {
        methodCache.delete(targetMethod);
      } else {
        methodCache.set(targetMethod, result);
      }
    });
  }
}

export default Flow;
