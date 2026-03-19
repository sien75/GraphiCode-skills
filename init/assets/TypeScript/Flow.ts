import { Observable, map } from 'rxjs';

type State = {
  on(eventName: string): Observable<any>;
  [key: string]: any;
};

const curried = (
  fn: Function,
  serialNumber: number,
  context: Map<number, any[]>
): (param: Record<string, any>) => any => {
  const collected: Record<string, any>[] = [];
  const step = (param: Record<string, any>): any => {
    collected.push(param);
    if (collected.length >= fn.length) {
      const output = fn(...collected);
      const records = context.get(serialNumber) ?? [];
      records.push({ input: [...collected], output });
      context.set(serialNumber, records);
      return output;
    }
    return step;
  };
  return step;
};

export class Flow {
  private curriedCache = new Map<object, Map<string, (param: Record<string, any>) => any>>();
  private context = new Map<number, any[]>();

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

    sourceState.on(eventName).pipe(
      ...algorithms.map(algo => map((payload: any) => algo({ context: this.context, payload })))
    ).subscribe((payload: Record<string, any>) => {
      if (!this.curriedCache.has(targetState)) {
        this.curriedCache.set(targetState, new Map());
      }
      const methodCache = this.curriedCache.get(targetState)!;

      if (!methodCache.has(targetMethod)) {
        const initial = curried(method.bind(targetState), serialNumber, this.context);
        const tagValue = tag?.linked ?? '';
        const afterTag = initial({ key: '__tag', value: tagValue });
        methodCache.set(targetMethod, afterTag);
      }

      const step = methodCache.get(targetMethod)!;
      const result = step({ key: targetParam, value: payload });

      if (typeof result !== 'function') {
        methodCache.delete(targetMethod);
      } else {
        methodCache.set(targetMethod, result);
      }
    });
  }
}
