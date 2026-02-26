interface Status {
  onEnabledChange(callback: (enabled: boolean) => void): void;
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
}

export default Status;
