import { map } from 'rxjs';
import State from './State';

export type UnicastDef = {
  targetState: State;
  targetMethod: string;
  targetParam: string;
  pipe: ((input: any) => any)[];
  then?: ThenDef;
  catch?: ThenDef;
};

export type BroadcastDef = {
  event: string;
};

export type ThenDef = UnicastDef | UnicastDef[] | BroadcastDef;

const isBroadcast = (def: ThenDef): def is BroadcastDef =>
  !Array.isArray(def) && 'event' in def;

const toUnicastArray = (def: ThenDef): UnicastDef[] | null =>
  isBroadcast(def) ? null : Array.isArray(def) ? def : [def];

const eventBus = new State();
eventBus.enable();

export class Flow {
  static eventBus = eventBus;

  private pendingThen = new Map<object, Map<string, { then?: ThenDef; catch?: ThenDef }>>();
  private logs = new Map<number, any[]>();

  private route(sn: number, def: ThenDef, value: any) {
    if (isBroadcast(def)) {
      eventBus._publish(def.event, value);
      return;
    }
    for (const t of toUnicastArray(def)!) {
      let v = value;
      for (const fn of t.pipe) v = fn({ logs: this.logs, payload: v });
      this.deliver(sn, t.targetState, t.targetMethod, t.targetParam, v, t.then, t.catch);
    }
  }

  private deliver(
    sn: number, targetState: State, targetMethod: string, targetParam: string,
    payload: any, thenDef?: ThenDef, catchDef?: ThenDef
  ) {
    const method = targetState[targetMethod];
    if (typeof method !== 'function') return;

    if (thenDef || catchDef) {
      if (!this.pendingThen.has(targetState)) this.pendingThen.set(targetState, new Map());
      const pt = this.pendingThen.get(targetState)!;
      if (!pt.has(targetMethod)) pt.set(targetMethod, { then: thenDef, catch: catchDef });
    }

    try {
      const output = method.call(targetState, this, { key: targetParam, value: payload });

      if (output === undefined) return;

      this.logs.set(sn, [...(this.logs.get(sn) ?? []), { method: targetMethod, param: targetParam, output }]);

      const stored = this.pendingThen.get(targetState)?.get(targetMethod);
      this.pendingThen.get(targetState)?.delete(targetMethod);
      const th = stored?.then;
      const ca = stored?.catch;

      if (th) {
        if (output != null && typeof output.then === 'function')
          output.then((v: any) => this.route(sn, th, v), (e: any) => ca && this.route(sn, ca, e));
        else
          this.route(sn, th, output);
      }
    } catch (err) {
      const stored = this.pendingThen.get(targetState)?.get(targetMethod);
      this.pendingThen.get(targetState)?.delete(targetMethod);
      const ca = stored?.catch;
      if (ca) this.route(sn, ca, err);
    }
  }

  protected _connect(
    serialNumber: number, sourceState: State | undefined, sourceEvent: string,
    targetState: State, targetMethod: string, targetParam: string,
    pipe: ((input: any) => any)[] = [], thenDef?: ThenDef, catchDef?: ThenDef
  ) {
    if (typeof targetState[targetMethod] !== 'function') return;
    const src = sourceState ?? eventBus;
    const ops: any = pipe.map(fn => map((payload: any) => fn({ logs: this.logs, payload })));
    const source$ = (src.on(sourceEvent).pipe as any)(...ops);
    source$.subscribe((payload: any) => {
      this.deliver(serialNumber, targetState, targetMethod, targetParam, payload, thenDef, catchDef);
    });
  }
}

export default Flow;
