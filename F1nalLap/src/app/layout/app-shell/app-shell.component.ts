import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
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
}
