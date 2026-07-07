# Pulido de botones y navbar — F1nalLap

Fecha: 2026-07-07
Estado: Aprobado

## Contexto

Tras el rediseño de Fase 1 y varias rondas de arreglo de contraste, cada página tiene su propio lenguaje de botones (negro plano en circuitos, gris claro en el simulador, transparente en el resto), sin radio/padding/transición consistentes. El navbar ya está centrado con indicador de página activa (dorado), pero carece de separación visual entre items, de indicador claro en los triggers de menú desplegable, y de una transición sutil al hacer scroll.

## Sistema de botones

Dos variantes, definidas como mixins en `src/styles/_tokens.scss` para reutilizar en cualquier `.scss` de componente:

- **`btn-primary`**: fondo `rgba($color-red, 0.16)`, borde `1px solid $color-red`, `clip-path` diagonal (esquina superior derecha cortada, como el CTA de Home), texto `$color-text`, hover → fondo `$color-red` sólido + `box-shadow` con `$color-red-glow`.
- **`btn-secondary`**: fondo transparente, borde `1px solid $color-surface-border`, texto `$color-text`, hover → fondo `rgba($color-red, 0.16)` + borde `$color-red`.
- Ambas comparten: `padding: 0.6rem 1.5rem`, `border-radius: 4px` (excepto el corte diagonal de `btn-primary`), `transition: all 0.3s ease`, `white-space: nowrap` (para no volver a cortar palabras), `min-width` en vez de `width` fijo.
- Variante clara (`btn-secondary-on-light`) para botones sobre tarjetas blancas (circuitos: "Estrategias"; simulador: "Añadir Stint"/"Eliminar"): mismo lenguaje pero con `color: #1a1a1a` y borde `#ccc`, hover en rojo de marca.

### Aplicación

- Home: `.btn-primary` ya existente se reescribe para usar el mixin (sin cambio visual).
- Circuitos: `.boton` → `btn-primary` (Simulador, acción principal) / `btn-secondary-on-light` (Estrategias); botones del simulador (`Añadir Stint`, `Simular`) → `btn-primary`; `Eliminar` → `btn-secondary-on-light`.
- Ranking: botones de vista (Pilotos/Equipos/Carreras) → `btn-secondary`, con estado activo usando `btn-primary`. "Mostrar Resultado" → `btn-primary`.
- Comparar / Últimas Temporadas: "Comparar Pilotos/Equipos", "Ranking de Pilotos/Equipos/Carreras" → `btn-secondary`; "mostrar todo" (link-button en tabla) sin cambio (ya usa `color: inherit`, es un enlace de texto, no un botón visual).
- Nav (`mat-mdc-button`): fuera del alcance del mixin (Material tiene su propio sistema vía `!important`), pero se alinea el `border-radius` a 4px y el `transition` a `0.3s ease` para que se sienta parte de la misma familia.

## Navbar

- **Separadores**: cada `nav a`/trigger de menú gana un borde izquierdo sutil (`1px solid $color-surface-border`) excepto el primero, en vez de solo `gap`.
- **Indicador de desplegable**: "Formula 1" y "Clasificación" ganan una flechita (▾, vía pseudo-elemento o `mat-icon`) que rota 180° cuando el menú está abierto (Angular Material expone la clase `mat-menu-trigger` con atributo `aria-expanded`; se engancha el CSS a `[aria-expanded="true"] .nav-chevron`).
- **Sombra al hacer scroll**: nueva directiva `NavScrollShadowDirective` (o extensión de la lógica ya presente en `ScrollProgressDirective`) que añade una clase `.scrolled` al `<nav>` cuando `scrollTop > 0`, con `box-shadow` más marcado que el actual (que es fijo). Reutiliza el mismo `@HostListener('window:scroll')` que ya existe, evitando un segundo listener redundante: se añade este comportamiento como una segunda responsabilidad expuesta por la misma directiva ya aplicada al `#progress-bar`, aplicada también al `<nav>` (dos elementos, un solo listener de scroll compartido vía el servicio/directiva).

## Fuera de alcance

- No se tocan colores de marca, tipografía, ni el resto del sistema de diseño ya aprobado.
- No se añaden nuevas dependencias (el chevron puede ser un carácter Unicode o `mat-icon` ya disponible vía Material Icons, ya cargado en `index.html`).
- No se restyla contenido de página más allá de los botones ya enumerados.

## Testing

- Tests existentes para `ScrollProgressDirective`/`AppShellComponent` se actualizan si la directiva de scroll cambia de responsabilidad.
- Verificación visual manual: nav con separadores, chevron rotando al abrir menú, sombra al hacer scroll, botones consistentes en circuitos/ranking/comparar/last-temps.
