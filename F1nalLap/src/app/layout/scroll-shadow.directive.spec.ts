import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollShadowDirective } from './scroll-shadow.directive';

@Component({
  standalone: true,
  imports: [ScrollShadowDirective],
  template: `<nav appScrollShadow></nav>`,
})
class ScrollShadowHostComponent {}

describe('ScrollShadowDirective', () => {
  it('adds the scrolled class once the page has scrolled', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ScrollShadowHostComponent],
    }).createComponent(ScrollShadowHostComponent);
    fixture.detectChanges();

    spyOnProperty(document.documentElement, 'scrollTop', 'get').and.returnValue(120);
    window.dispatchEvent(new Event('scroll'));

    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    expect(nav.classList.contains('scrolled')).toBeTrue();
  });

  it('removes the scrolled class back at the top of the page', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [ScrollShadowHostComponent],
    }).createComponent(ScrollShadowHostComponent);
    fixture.detectChanges();

    const scrollTopSpy = spyOnProperty(document.documentElement, 'scrollTop', 'get');
    scrollTopSpy.and.returnValue(120);
    window.dispatchEvent(new Event('scroll'));

    scrollTopSpy.and.returnValue(0);
    window.dispatchEvent(new Event('scroll'));

    const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
    expect(nav.classList.contains('scrolled')).toBeFalse();
  });
});
