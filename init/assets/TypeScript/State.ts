import { Subject } from 'rxjs';

interface State {
  // state enable
  onEnabledChange(): Subject<boolean>;
  isEnabled(): boolean;
  enable(): void;
  disable(): void;

  // get all state
  getState(): any;

  // on state change
  on(eventId: string): Subject;
}

export default State;
