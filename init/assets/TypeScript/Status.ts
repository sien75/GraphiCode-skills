import { Subject } from 'rxjs';

interface Status {
  onEnabledChange(): Subject<boolean>;
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
}

export default Status;
