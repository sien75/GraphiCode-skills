import { Subject } from 'rxjs';

/**
 * Method decorator: skips execution when `this._enabled` is false.
 * Apply to public setter methods in State classes so they are
 * automatically guarded by the enabled state.
 */
function guardEnabled<This extends { _enabled: boolean }, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  _context: ClassMethodDecoratorContext<This>,
) {
  return function (this: This, ...args: Args): Return | undefined {
    if (!this._enabled) return;
    return target.apply(this, args);
  };
}

class Subscription {
  protected _subjects: Map<string, Subject<any>> = new Map();
  protected _enabledSubject = new Subject<boolean>();
  protected _enabled = false;

  public isEnabled(): boolean {
    return this._enabled;
  }

  public enable(): void {
    this._enabled = true;
    this._enabledSubject.next(true);
  }

  public disable(): void {
    this._enabled = false;
    this._enabledSubject.next(false);
  }

  public onEnabledChange(): Subject<boolean> {
    return this._enabledSubject;
  }

  [key: string]: any;

  public _subscribe(id: string): Subject<any> {
    if (!this._subjects.has(id)) {
      this._subjects.set(id, new Subject<any>());
    }

    return this._subjects.get(id)!;
  }

  public _publish(id: string, payload?: any): void {
    if (!this._enabled) return;

    const subject = this._subjects.get(id);
    if (subject) {
      subject.next(payload);
    }
  }
}

export default Subscription;
export { guardEnabled };
