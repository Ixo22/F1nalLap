import { Directive, ContentChildren, AfterContentInit, QueryList } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appCloseOtherMenus]'
})
export class CloseOtherMenusDirective implements AfterContentInit {
  @ContentChildren(MatMenuTrigger, { descendants: true })
  triggers!: QueryList<MatMenuTrigger>;

  private subs: Subscription[] = [];

  ngAfterContentInit() {
    this.triggers.forEach(trigger => {
      const sub = trigger.menuOpened.subscribe(() => this.onMenuOpen(trigger));
      this.subs.push(sub);
    });
  }

  private onMenuOpen(opened: MatMenuTrigger) {
    this.triggers.forEach(trigger => {
      if (trigger !== opened) {
        trigger.closeMenu();
      }
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
