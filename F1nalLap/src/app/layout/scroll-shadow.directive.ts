import { Directive, ElementRef, HostListener, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appScrollShadow]',
  standalone: true,
})
export class ScrollShadowDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrolled = document.documentElement.scrollTop > 0;
    if (scrolled) {
      this.renderer.addClass(this.el.nativeElement, 'scrolled');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'scrolled');
    }
  }
}
