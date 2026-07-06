import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollProgressDirective } from './scroll-progress.directive';

@Component({
  standalone: true,
  imports: [ScrollProgressDirective],
  template: `<div id="progress-bar" appScrollProgress></div>`,
})
class ScrollProgressHostComponent {}

describe('ScrollProgressDirective', () => {
  describe('computeProgress', () => {
    it('returns 0 at the top of the page', () => {
      expect(ScrollProgressDirective.computeProgress(0, 2000, 800)).toBe(0);
    });
    it('returns 100 at the bottom of the page', () => {
      expect(ScrollProgressDirective.computeProgress(1200, 2000, 800)).toBe(100);
    });
    it('returns a proportional value mid-scroll', () => {
      expect(ScrollProgressDirective.computeProgress(600, 2000, 800)).toBe(50);
    });
    it('returns 0 when the content is shorter than the viewport', () => {
      expect(ScrollProgressDirective.computeProgress(0, 500, 800)).toBe(0);
    });
  });

  it('sets the host element width on window scroll', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ScrollProgressHostComponent],
    }).createComponent(ScrollProgressHostComponent);
    fixture.detectChanges();

    spyOnProperty(document.documentElement, 'scrollTop', 'get').and.returnValue(400);
    spyOnProperty(document.documentElement, 'scrollHeight', 'get').and.returnValue(2000);
    spyOnProperty(document.documentElement, 'clientHeight', 'get').and.returnValue(800);

    window.dispatchEvent(new Event('scroll'));

    const bar: HTMLElement = fixture.nativeElement.querySelector('#progress-bar');
    expect(parseFloat(bar.style.width)).toBeCloseTo((400 / 1200) * 100, 2);
  });
});
