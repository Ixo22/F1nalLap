import { TestBed } from '@angular/core/testing';
import { OverlayStateService } from './overlay-state.service';

describe('OverlayStateService', () => {
  let service: OverlayStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlayStateService);
  });

  it('starts closed', () => {
    expect(service.isOpen()).toBeFalse();
  });
  it('reflects setOpen(true)', () => {
    service.setOpen(true);
    expect(service.isOpen()).toBeTrue();
  });
  it('reflects setOpen(false) after being open', () => {
    service.setOpen(true);
    service.setOpen(false);
    expect(service.isOpen()).toBeFalse();
  });
});
