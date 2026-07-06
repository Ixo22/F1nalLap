import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appScrollProgress]',
  standalone: true,
})
export class ScrollProgressDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const progress = ScrollProgressDirective.computeProgress(scrollTop, scrollHeight, clientHeight);
    this.el.nativeElement.style.width = `${progress}%`;
  }

  static computeProgress(scrollTop: number, scrollHeight: number, clientHeight: number): number {
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
  }
}
