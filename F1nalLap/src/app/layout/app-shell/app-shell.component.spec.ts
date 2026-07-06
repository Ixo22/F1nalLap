import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppShellComponent } from './app-shell.component';
import { OverlayStateService } from '../overlay-state.service';

describe('AppShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the shell', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the router-outlet, nav and footer', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('nav')).toBeTruthy();
    expect(compiled.querySelector('footer')).toBeTruthy();
  });

  it('raises the progress-container z-index while the overlay service reports open', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    const overlayState = TestBed.inject(OverlayStateService);
    const container: HTMLElement = fixture.nativeElement.querySelector('#progress-container');
    expect(container.style.zIndex).toBe('');
    overlayState.setOpen(true);
    fixture.detectChanges();
    expect(container.style.zIndex).toBe('950');
  });
});
