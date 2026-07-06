# Rediseño UI/UX F1nalLap — Fase 1 (sistema de diseño + AppShell + Home) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar el sistema de diseño "editorial premium de motorsport" (ver spec) al proyecto F1nalLap: tokens de color/tipografía globales, un `AppShellComponent` compartido que reemplaza el header/nav/footer duplicado en las 7 páginas, y el restyle completo de la página Home.

**Architecture:** SCSS con variables/mixins centralizados en `src/styles/_tokens.scss`, consumidos por `src/styles.scss` (estilos globales) y por los `.scss` de componentes concretos. Un `AppShellComponent` standalone envuelve el `<router-outlet>` en `app.component.html`; expone la barra de progreso de scroll vía una directiva Angular (`ScrollProgressDirective`, sustituye el script vanilla JS) y coordina el z-index del overlay vía un servicio (`OverlayStateService`) en vez de que `RankingComponent` manipule el shell directamente.

**Tech Stack:** Angular 19 standalone components, SCSS, Angular Material (theming vía overrides existentes con `!important`, sin nuevas dependencias), Karma/Jasmine.

## Global Constraints

- No se introducen nuevas dependencias de librería.
- No se cambian rutas, lógica de negocio de `F1ApiService`/`EstrategiasService`, ni modelos de datos.
- No se cambia el logo oficial de F1 ni el favicon.
- Cobertura mínima existente en `karma.conf.js`: 70% statements/lines, 60% functions, 50% branches — no debe bajar.
- Wordmark "F1nal Lap" mantiene la fuente **Audiowide**; títulos usan **Space Grotesk**; cuerpo usa **Inter**.
- Paleta: fondo `#0a0a0c`, rojo de marca `#c81e1e`, dorado `#c9a35c`, superficie sólida `#141416`, texto `#f2f0ec`.
- Glass cards (blur) solo en elementos destacados; listas largas usan superficie sólida. Ningún elemento de Fase 1 requiere glass.

---

### Task 1: Tokens de diseño y estilos globales base

**Files:**
- Create: `src/styles/_tokens.scss`
- Modify: `src/styles.scss` (reescritura completa)
- Modify: `src/index.html:9-11` (fuentes)

- [ ] **Step 1: Crear `src/styles/_tokens.scss`**

```scss
// Sistema de diseño "editorial premium de motorsport"
$color-bg: #0a0a0c;
$color-bg-gradient: radial-gradient(ellipse at top, #1a1a1d 0%, #0a0a0c 65%);
$color-red: #c81e1e;
$color-red-glow: rgba(200, 30, 30, 0.45);
$color-gold: #c9a35c;
$color-surface: #141416;
$color-surface-border: rgba(255, 255, 255, 0.08);
$color-glass-bg: rgba(255, 255, 255, 0.04);
$color-glass-border: rgba(201, 163, 92, 0.35);
$color-text: #f2f0ec;
$color-text-secondary: #a8a5a0;

$font-brand: 'Audiowide', sans-serif;
$font-heading: 'Space Grotesk', sans-serif;
$font-body: 'Inter', sans-serif;

@mixin surface-solid {
  background-color: $color-surface;
  border: 1px solid $color-surface-border;
  border-radius: 12px;
}

@mixin surface-glass {
  background-color: $color-glass-bg;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid $color-glass-border;
  border-radius: 12px;
}
```

- [ ] **Step 2: Reescribir `src/styles.scss`** para usar `@use 'styles/tokens' as *;` y sustituir todos los colores hardcoded (`#da0000`, `black`, `white`) por las variables, quitar el `body::before` con la imagen de bandera a cuadros tileada, y recolorear `#progress-bar` a `$color-gold`, los overrides `.mat-mdc-*` y `#dialogo` a los tokens de superficie/texto/rojo.

- [ ] **Step 3: Actualizar fuentes en `src/index.html`** — sustituir los links de Audiowide+Roboto por un único link combinado `Audiowide|Space+Grotesk:wght@500;700|Inter:wght@400;500;600`.

- [ ] **Step 4: Verificar build**

Run: `npm run build -- --configuration development`
Expected: sin errores.

- [ ] **Step 5: Comprobación visual manual** — `npm start`, revisar `/home`: fondo con gradiente (sin bandera repetida), header/nav/footer oscuros, barra de progreso dorada.

- [ ] **Step 6: Commit**

```bash
git add src/styles/_tokens.scss src/styles.scss src/index.html
git commit -m "style: introduce editorial-premium motorsport design tokens"
```

---

### Task 2: `ScrollProgressDirective` (sustituye `barra_deslizante.js`)

**Files:**
- Create: `src/app/layout/scroll-progress.directive.ts` + `.spec.ts`
- Delete: `src/assets/js/barra_deslizante.js`
- Modify: `angular.json` (quitar `"scripts"` de `build.options` y `test.options`)
- Modify: `src/index.html` (quitar el `<script src="src/assets/js/barra_deslizante.js">`)

**Interfaces:**
- Produces: `ScrollProgressDirective` (selector `[appScrollProgress]`, standalone), método estático `computeProgress(scrollTop, scrollHeight, clientHeight): number`. Consumido por `AppShellComponent` (Task 4).

- [ ] **Step 1: Test en fallo** — `src/app/layout/scroll-progress.directive.spec.ts`:

```ts
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
    expect(bar.style.width).toBe(`${(400 / 1200) * 100}%`);
  });
});
```

Run: `npm test -- --include='**/scroll-progress.directive.spec.ts'` → FAIL (module not found).

- [ ] **Step 2: Implementar** `src/app/layout/scroll-progress.directive.ts`:

```ts
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
```

Run: `npm test -- --include='**/scroll-progress.directive.spec.ts'` → PASS (5 specs).

- [ ] **Step 3: Retirar el script vanilla JS** — borrar `src/assets/js/barra_deslizante.js`; quitar la línea `"scripts": ["src/assets/js/barra_deslizante.js"],` de `angular.json` (build y test); quitar `<script src="src/assets/js/barra_deslizante.js"></script>` de `src/index.html`.

- [ ] **Step 4: Verificar build** — `npm run build -- --configuration development` → sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout/scroll-progress.directive.ts src/app/layout/scroll-progress.directive.spec.ts angular.json src/index.html
git rm src/assets/js/barra_deslizante.js
git commit -m "feat(layout): replace vanilla scroll-progress script with ScrollProgressDirective"
```

---

### Task 3: `OverlayStateService`

**Files:** Create `src/app/layout/overlay-state.service.ts` + `.spec.ts`

**Interfaces:** Produces `OverlayStateService` (`providedIn: 'root'`), `isOpen: Signal<boolean>`, `setOpen(open: boolean): void`. Consumido por `AppShellComponent` (Task 4) y `RankingComponent` (Task 6).

- [ ] **Step 1: Test en fallo** — `overlay-state.service.spec.ts`:

```ts
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
```

Run: `npm test -- --include='**/overlay-state.service.spec.ts'` → FAIL.

- [ ] **Step 2: Implementar** `overlay-state.service.ts`:

```ts
import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OverlayStateService {
  private readonly _isOpen: WritableSignal<boolean> = signal(false);
  readonly isOpen: Signal<boolean> = this._isOpen.asReadonly();

  setOpen(open: boolean): void {
    this._isOpen.set(open);
  }
}
```

Run: `npm test -- --include='**/overlay-state.service.spec.ts'` → PASS (3 specs).

- [ ] **Step 3: Commit**

```bash
git add src/app/layout/overlay-state.service.ts src/app/layout/overlay-state.service.spec.ts
git commit -m "feat(layout): add OverlayStateService for shell/page overlay coordination"
```

---

### Task 4: `AppShellComponent` compartido

**Files:**
- Create: `src/app/layout/app-shell/app-shell.component.{ts,html,scss,spec.ts}`
- Modify: `src/app/app.component.ts`, `src/app/app.component.html`

**Interfaces:** Consumes `OverlayStateService` (Task 3), `ScrollProgressDirective` (Task 2), `CloseOtherMenusDirective` (`src/app/Cerrado/cerrado.component.ts`, sin cambios). Produces `AppShellComponent` (selector `app-shell`), montado una vez en `AppComponent`.

- [ ] **Step 1: Crear el componente** — `app-shell.component.ts`:

```ts
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';
import { OverlayStateService } from '../overlay-state.service';
import { ScrollProgressDirective } from '../scroll-progress.directive';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    CloseOtherMenusDirective,
    ScrollProgressDirective,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  protected readonly overlayState = inject(OverlayStateService);
}
```

`app-shell.component.html` — header/nav/footer extraídos tal cual de las páginas actuales (idéntico markup a lo que hoy vive duplicado en cada página), con `<router-outlet>` como contenido y `[style.z-index]="overlayState.isOpen() ? 950 : null"` en `#progress-container`, y `appScrollProgress` en `#progress-bar` en vez del script vanilla JS.

`app-shell.component.scss`:

```scss
// El estilado de header/nav/footer vive en los selectores globales
// de src/styles.scss (no encapsulados), así que se aplican igual aquí.
// Vacío intencionadamente en la Fase 1.
```

- [ ] **Step 2: Montar el shell en `AppComponent`** — `app.component.ts` pasa a importar y renderizar solo `<app-shell></app-shell>`; `app.component.html` se reduce a esa única línea.

- [ ] **Step 3: Tests del shell** — `app-shell.component.spec.ts`:

```ts
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
```

Run: `npm test -- --include='**/app-shell.component.spec.ts' --include='**/app.component.spec.ts'` → PASS. El test existente `should render a router-outlet` de `app.component.spec.ts` no necesita cambios: Angular renderiza el `router-outlet` de `AppShellComponent` como descendiente del DOM nativo de `AppComponent`.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout/app-shell src/app/app.component.ts src/app/app.component.html
git commit -m "refactor(layout): extract header/nav/footer into a shared AppShellComponent"
```

---

### Task 5: Retirar el header/nav/footer duplicado de las 6 páginas restantes

**Files:** Modify HTML+TS de `home`, `temp-actual`, `last-temps`, `memorable-temps`, `circuits`, `comparar`.

> **Por qué ahora:** desde que `AppShellComponent` envuelve el `router-outlet`, las 7 páginas se renderizan dentro de él. Si una página conserva su propio header/nav/footer, se verían duplicados en cada ruta — una regresión visible. La extracción mecánica cubre las 7 páginas ya en la Fase 1, aunque el restyle visual de contenido de cada página (salvo Home) quede para fases siguientes.

- [ ] **Step 1: Home** — el `.html` pasa a contener solo `<div class="contenedor-section">` con las 5 `<section>` existentes (`inicio`, `que-encontraras`, `proposito`, `explora-disfruta`, `contacto`), byte-a-byte igual salvo quitar el wrapper `container/content/header/nav/footer`. El `.ts` pierde `RouterModule`, `MatMenuModule`, `MatButtonModule`, `CloseOtherMenusDirective` (solo se usaban en el nav): queda `imports: []`.

- [ ] **Step 2: Temp-actual** — mismo tratamiento: `.html` solo con `<div class="contenedor-section"><section class="temp_act">...</section></div>` (contenido intacto), `.ts` con `imports: []`.

- [ ] **Step 3: Last-temps** — `.html` solo con el contenido (`<section>` con el formulario de temporada y las 3 tablas). En el `.ts`, quitar del bloque de imports y del array `imports: [...]` únicamente `RouterModule`, `MatMenuModule`, `CloseOtherMenusDirective`, `MatButtonModule` (el resto — `MatSlideToggleModule`, `CommonModule`, `MatInputModule`, `FormsModule`, `MatFormFieldModule`, `ReactiveFormsModule`, `MatTableModule` — se usan en el contenido y no se tocan).

- [ ] **Step 4: Memorable-temps** — `.html` solo con las 5 `<section>` (2012/2005/1994/1988/1976), `.ts` con `imports: []`.

- [ ] **Step 5: Circuits** — `.html` solo con el contenido (autocomplete de circuitos + tarjetas + simulador + gráficos). En el `.ts`, quitar `RouterModule`, `MatMenuModule`, `MatMenuTrigger`, `MatButtonModule`, `CloseOtherMenusDirective` del import y del array (`CommonModule`, `MatMenuTrigger` **exclusivamente** usado en el nav — confirmar con grep que no aparece en ningún `@ViewChild` ni en el resto de la clase antes de borrarlo). El resto de módulos (`FormsModule`, `ReactiveFormsModule`, `MatAutocompleteModule`, `MatFormFieldModule`, `MatIconModule`, `MatInputModule`, `MatSnackBarModule`, `NgxChartsModule`) no se tocan.

- [ ] **Step 6: Comparar** — `.html` solo con el contenido (selector de temporada + comparador de pilotos/equipos + gráficos). En el `.ts`, quitar `RouterModule`, `MatMenuModule`, `MatButtonModule`, `CloseOtherMenusDirective`; mantener el resto (`MatSlideToggleModule`, `CommonModule`, `MatInputModule`, `MatIconModule`, `MatAutocompleteModule`, `MatFormFieldModule`, `ReactiveFormsModule`, `MatTableModule`, `MatSelectModule`, `NgxChartsModule`).

- [ ] **Step 7: Ejecutar toda la suite**

Run: `npm test -- --watch=false`
Expected: PASS en todos los specs existentes (`app.component`, `circuits.component`, `comparar.component`, `ranking.component`, servicios) — ninguno referencia el header/nav/footer retirado.

- [ ] **Step 8: Verificación visual manual** — `npm start`; visitar `/home`, `/actual`, `/last`, `/memorable`, `/circuits`, `/comparar`: un solo header/nav/footer (el del shell), contenido propio igual que antes, sin errores en consola.

- [ ] **Step 9: Commit**

```bash
git add src/app/pages/home src/app/pages/temp-actual src/app/pages/last-temps src/app/pages/memorable-temps src/app/pages/circuits src/app/pages/comparar
git commit -m "refactor(pages): remove duplicated header/nav/footer now provided by AppShellComponent"
```

---

### Task 6: `RankingComponent` adopta `OverlayStateService` y quita su chrome duplicado

**Files:** Modify `ranking.component.{html,ts,spec.ts}`

- [ ] **Step 1:** `.html` pasa a contener solo `<div class="contenedor-section"><section>...</section></div>` con el contenido de ranking intacto (sin el `[style.z-index]` que vivía en su `#progress-container`, porque ese div ya no existe en esta página).

- [ ] **Step 2:** en `.ts`, quitar del import y del array `imports: [...]` `MatMenuModule`, `MatButtonModule`, `CloseOtherMenusDirective` (mantener `RouterModule`, usado por `[routerLink]`/`[queryParams]` en los botones de vista propios del contenido). Añadir `import { OverlayStateService } from '../../layout/overlay-state.service';`, inyectarlo como `private overlayState = inject(OverlayStateService);`, quitar el campo `dialogOpen` y su comentario, y en `openDialog` sustituir `this.dialogOpen.set(true)` → `this.overlayState.setOpen(true)` y `this.dialogOpen.set(false)` → `this.overlayState.setOpen(false)`.

- [ ] **Step 3: Añadir test de la coordinación con `OverlayStateService`** — en `ranking.component.spec.ts`, importar `Subject` de `rxjs` y `OverlayStateService`, y añadir:

```ts
  it('opens the overlay state while the race result dialog is open, and closes it after', () => {
    const overlayState = TestBed.inject(OverlayStateService);
    const afterClosed$ = new Subject<void>();
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(afterClosed$.asObservable());
    const dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    dialogSpy.open.and.returnValue(dialogRefSpy);
    f1ApiSpy.getRaceResults.and.returnValue(of([raceResult]));

    const fixture = TestBed.createComponent(RankingComponent);
    fixture.detectChanges();

    fixture.componentInstance.openDialog('1', 'Australia Grand Prix');
    expect(overlayState.isOpen()).toBeTrue();

    afterClosed$.next();
    expect(overlayState.isOpen()).toBeFalse();
  });
```

- [ ] **Step 4:** Run: `npm test -- --include='**/ranking.component.spec.ts'` → PASS (5 specs).

- [ ] **Step 5:** Run: `npm test -- --watch=false` → PASS completo.

- [ ] **Step 6: Verificación visual manual** — `/ranking`, vista Carreras, "Mostrar Resultado": el diálogo se abre por encima de la barra de progreso y se cierra bien.

- [ ] **Step 7: Commit**

```bash
git add src/app/pages/ranking
git commit -m "refactor(ranking): use OverlayStateService instead of shell-coupled dialogOpen signal"
```

---

### Task 7: Restyle premium de la página Home

**Files:** Modify `home.component.{html,scss}`, Create `home.component.spec.ts`

- [ ] **Step 1:** Crear `home.component.spec.ts` (no existía) con un smoke test de creación y un test que el CTA `a.btn-primary` apunte a `circuits`.

- [ ] **Step 2:** Run: `npm test -- --include='**/home.component.spec.ts'` — confirmar el estado antes del restyle.

- [ ] **Step 3:** En `home.component.html`, añadir `class="hero"` a `<section id="inicio">` y `class="hero-subtitle"` a su `<p>`; simplificar el CTA de `<p>→ <a href="circuits" class="btn-primary"><strong>Ir al Simulador</strong></a> ←</p>` a `<p class="cta"><a href="circuits" class="btn-primary">Ir al Simulador →</a></p>`.

- [ ] **Step 4:** Reescribir `home.component.scss` con `@use '../../../styles/tokens' as *;` y las reglas `.hero`, `.hero-subtitle`, `.cta`, `.btn-primary` (borde rojo, esquina cortada vía `clip-path`, glow al hover) y recolorear `#contacto a`/`#que-encontraras a` a `$color-text`/`$color-gold`/`$color-red`.

- [ ] **Step 5:** Run: `npm test -- --include='**/home.component.spec.ts'` → PASS (2 specs).

- [ ] **Step 6:** Run: `npm test -- --watch=false --code-coverage` → PASS, umbrales de `karma.conf.js` cumplidos.

- [ ] **Step 7: Verificación visual manual** — `/home`: hero centrado, botón con corte diagonal y glow rojo al hover, resto de secciones consistentes.

- [ ] **Step 8: Commit**

```bash
git add src/app/pages/home
git commit -m "style(home): apply premium editorial visual system to the Home page"
```

---

## Resumen de verificación final

- [ ] `npm run lint` sin errores nuevos.
- [ ] `npm test -- --watch=false --code-coverage` en verde, cobertura por encima de los umbrales.
- [ ] `npm run build` (producción) sin errores.
- [ ] Recorrido manual de las 7 rutas confirmando un único header/nav/footer, barra de progreso dorada funcional, y el nuevo sistema visual en Home.
