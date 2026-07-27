import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';
import { OverlayStateService } from '../overlay-state.service';
import { ScrollProgressDirective } from '../scroll-progress.directive';
import { ScrollShadowDirective } from '../scroll-shadow.directive';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    CloseOtherMenusDirective,
    ScrollProgressDirective,
    ScrollShadowDirective,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  protected readonly overlayState = inject(OverlayStateService);
  private readonly router = inject(Router);

  // En móvil el nav se oculta detrás de un botón hamburguesa (ver
  // styles.scss, breakpoint ≤620px); se cierra solo al completar una
  // navegación, sea cual sea el enlace o submenú que la haya disparado.
  protected readonly mobileNavOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.mobileNavOpen.set(false));
  }

  protected toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }
}
