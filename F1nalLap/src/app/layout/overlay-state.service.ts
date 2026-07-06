import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OverlayStateService {
  private readonly _isOpen: WritableSignal<boolean> = signal(false);
  readonly isOpen: Signal<boolean> = this._isOpen.asReadonly();

  setOpen(open: boolean): void {
    this._isOpen.set(open);
  }
}
