import { Subject, Subscription as RxSubscription, concat, Observable, of } from 'rxjs';
import Subscription from './Subscription';

function curryObj(fn: Function, that: any): Function {
  const arity = fn.length;

  if (arity === 0) {
    return fn.bind(that);
  }

  return function curried(accArgs: Record<string, any> = {}) {
    return function (newArg: Record<string, any>) {
      const nextArgs = { ...accArgs, ...newArg };
      
      if (Object.keys(nextArgs).length >= arity) {
        const argsArray = Object.keys(nextArgs).map(key => ({ [key]: nextArgs[key] }));
        return fn.apply(that, argsArray);
      } else {
        // Not enough arguments yet, return a new closure waiting for more
        return curried(nextArgs);
      }
    };
  }(); // Immediately invoke to set up the initial empty accumulator
}

class Flow {
  private _curriedMethods: Map<string, Function> = new Map();
  private _execResults: Record<number, any> = {};

  protected _context = (payload: any) => {
    return { context: this._execResults, payload };
  };

  private _getCurriedMethod(targetState: any, targetMethod: string): Function {
    const key = `${targetState.constructor.name}_${targetMethod}`;
    
    if (!this._curriedMethods.has(key)) {
      const originalMethod = targetState[targetMethod];
      this._curriedMethods.set(key, curryObj(originalMethod, targetState));
    }
    
    return this._curriedMethods.get(key)!;
  }

  protected _connect(
    serialNumber: number,
    type: 'async' | 'sync' | 'return',
    sourceState: Subscription,
    sourceMethod: string,
    targetState: Subscription,
    targetMethod: string,
    targetParam: string | undefined,
    ...algorithms: any[]
  ): Observable<any> {
    let source$: Observable<any>;

    if (type === 'async') {
      source$ = (sourceState as any)[sourceMethod]();
    } else if (type === 'sync') {
      // Sync calls don't have an initial payload from a subject, just trigger it
      source$ = of(undefined);
    } else if (type === 'return') {
      // Return type handling placeholder
      source$ = of(undefined);
    } else {
      throw new Error(`Unknown connection type: ${type}`);
    }

    // @ts-ignore - TS doesn't know about the pipe spread
    const processed$ = algorithms.length > 0 ? source$.pipe(...algorithms) : source$;

    return new Observable(subscriber => {
      const subscription = processed$.subscribe({
        next: (result: any) => {
          const currentCurriedMethod = this._getCurriedMethod(targetState, targetMethod);

          let execResult;
          if (targetParam !== undefined) {
             execResult = currentCurriedMethod({ [targetParam]: result });
          } else {
             execResult = currentCurriedMethod();
          }

          if (typeof execResult === 'function') {
            // Function returned a new curried function (still waiting for args)
            const key = `${targetState.constructor.name}_${targetMethod}`;
            this._curriedMethods.set(key, execResult);
          } else {
            // Function fully executed!
            const key = `${targetState.constructor.name}_${targetMethod}`;
            this._curriedMethods.delete(key);
            
            this._execResults[serialNumber] = execResult;
            subscriber.next(execResult);
          }
        },
        error: (err: any) => subscriber.error(err),
        complete: () => subscriber.complete()
      });

      return () => subscription.unsubscribe();
    });
  }

  protected _concat(...observables: Observable<any>[]): RxSubscription {
    return concat(...observables).subscribe();
  }
}

export default Flow;