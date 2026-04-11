import { Subject } from 'rxjs';

class Subscription {
  private _subjects: Map<string, Subject<any>> = new Map();
  private _enabledSubject = new Subject<boolean>();
  private _enabled = false;

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
