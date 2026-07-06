# Rediseño UI/UX — F1nalLap ("editorial premium de motorsport")

Fecha: 2026-07-06
Estado: Aprobado (brainstorming) — pendiente de plan de implementación

## Contexto

F1nalLap es una SPA Angular (7 páginas: home, temp-actual, last-temps,
memorable-temps, circuits/simulador, ranking, comparar) con un estilo visual
básico: Arial, fondo negro con una imagen de bandera a cuadros tileada de baja
resolución (hotlinked desde un stock photo externo), botones grises genéricos,
tarjetas blancas sólidas con bordes negros, y colores por defecto de Angular
Material/ngx-charts sin personalizar.

El objetivo es una renovación visual completa manteniendo la identidad de
carreras (F1), llevando el UI/UX a un nivel "premium editorial de motorsport"
(revista de automovilismo de lujo, no "gamer HUD" ni minimalismo de tabla de
tiempos — esas dos direcciones se propusieron y se descartaron).

Problema estructural detectado durante la exploración: el `<header>`, `<nav>`
(con sus `mat-menu`) y `<footer>` están duplicados literalmente en las 7
páginas, con pequeñas divergencias ya existentes entre copias (p.ej.
`ranking.component.html` añade `[style.z-index]="dialogOpen()"` al
`#progress-container`, algo que las demás páginas no tienen). Este rediseño
incluye extraer esa duplicación a un layout compartido, ya que redecorar 7
copias manualmente sería frágil y propenso a divergencia.

## Dirección visual: editorial premium de motorsport

- Fondo: negro/gris muy oscuro con gradiente sutil (no textura repetida).
- Acentos: rojo de marca desaturado + dorado/plata para detalles premium.
- Tarjetas: glass cards con blur en elementos destacados, sombras suaves,
  bordes redondeados.
- Micro-interacciones: fades suaves, parallax ligero en imágenes.
- El motivo de bandera a cuadros pasa de "papel tapiz" de fondo a acento
  puntual (separadores finos, detalle de borde), coherente con el tono
  editorial en vez de "gamer".

## Sistema de diseño

### Paleta

| Uso | Valor | Nota |
|---|---|---|
| Fondo base | `#0a0a0c` | gradiente radial muy sutil, sin imagen repetida |
| Rojo de marca | `#c81e1e` | versión desaturada del `#da0000` actual |
| Acento premium | `#c9a35c` (dorado/champán) | uso puntual: posición #1, badges de récord, bordes activos/foco |
| Superficie sólida | `#141416` | cards de listas largas (ranking completo) |
| Superficie glass | `rgba(255,255,255,0.04)` + `backdrop-filter: blur(12px)` | solo en elementos destacados |
| Texto principal | `#f2f0ec` (blanco cálido) | sustituye blanco puro |
| Texto secundario | gris cálido (~`#a8a5a0`) | |

### Tipografía

- Wordmark "F1nal Lap": se mantiene **Audiowide** (identidad de marca ya
  reconocible, no se toca).
- Títulos de sección (`h2`, `h3`): **Space Grotesk** (sans de peso alto,
  carácter técnico sin caer en "gamer").
- Cuerpo de texto y tablas: **Inter**, prioriza legibilidad de datos.
- Se elimina Arial/Roboto genérico de `styles.scss`/`index.html`.

### Uso de glass cards (regla de aplicación)

- **Glass (blur + transparencia + borde dorado sutil):** podio de carrera,
  circuito seleccionado en el simulador, resultado de carrera/temporada en
  diálogo — es decir, elementos destacados y en número reducido.
- **Superficie sólida simple:** listas largas (ranking completo de 20
  pilotos/equipos, tabla de carreras de la temporada) — evita el coste de
  `backdrop-filter` repetido en decenas de elementos simultáneos y mantiene la
  legibilidad de datos tabulares.

### Componentes

- **Botones:** dos variantes — *primario* (rojo de marca, esquina
  superior-derecha cortada en diagonal como guiño racing, glow rojo sutil en
  hover) y *secundario* (borde fino translúcido, fondo transparente). Los
  `mat-mdc-button` se restylean vía Angular Material theming en vez de reglas
  sueltas con `!important`.
- **Cards:** base sólida oscura + borde 1px translúcido; variante destacada
  añade blur y borde dorado (ver regla de glass cards arriba).
- **Tablas/rankings:** la posición se muestra como número grande tipográfico
  (estilo panel de cronometraje), separador fino en vez del `<hr>` grueso
  actual, hover de fila sutil (ya no el cambio a rojo sólido actual).
- **Formularios** (autocomplete de circuitos en el simulador): `mat-form-field`
  restyleado a fondo oscuro, borde fino, label dorado en foco.
- **Charts (ngx-charts, página comparar):** paleta recoloreada (rojo + dorado +
  grises cálidos en vez de los colores por defecto de la librería), fondo
  transparente para integrarse con las cards oscuras, tooltips restyleados.
- **Diálogos** (`dialog-2025-race-results`, `dialog-season-results`): mismo
  tratamiento glass premium que las cards destacadas.

## Arquitectura: AppShell compartido

- Nuevo componente standalone `AppShellComponent` en
  `src/app/layout/app-shell/`, con el `<header>`, `<nav>` (menús "Formula 1" /
  "Clasificación") y `<footer>` actuales, más un `<router-outlet>` interno
  para el contenido de cada página.
- Se monta una única vez en `app.component.html` envolviendo el
  `<router-outlet>` actual (que pasa a vivir dentro del shell), en vez de
  redeclararse en cada página.
- Cada una de las 7 páginas deja de incluir su propio `<header>`/`<nav>`/
  `<footer>` (~40 líneas duplicadas menos por página) y solo aporta su
  `<section>` de contenido.
- La barra de progreso de scroll (`#progress-bar`), hoy manipulada por
  `src/assets/js/barra_deslizante.js` vía `document.getElementById` directo,
  se reimplementa como directiva/servicio Angular con
  `HostListener('window:scroll')`. Esto además retira el `<script src=...>`
  global de `index.html`, en línea con el trabajo ya hecho en la Fase 6
  ("quita manipulación directa del DOM en overlays").
- El caso especial de `ranking` (subir el z-index del progress-bar cuando hay
  un diálogo de resultado abierto) se resuelve con un servicio de "estado de
  overlay" (p.ej. `OverlayStateService` con un signal/BehaviorSubject) que el
  AppShell consume, en vez de que la página toque el DOM/z-index del shell
  directamente.

## Alcance por fases

- **Fase 1 (este spec cubre el diseño de esta fase):** sistema de diseño base
  (variables SCSS de color/tipografía en `styles.scss`), `AppShellComponent`,
  restyle completo de `home`. Sirve como validación del sistema antes de
  aplicarlo al resto.
- **Fases siguientes (fuera de este spec, a planificar después):** aplicar el
  mismo sistema a `ranking`, `comparar` (incluye charts), `circuits`
  (simulador, incluye autocomplete), `temp-actual`, `last-temps`,
  `memorable-temps`, y los dos diálogos.

## Fuera de alcance

- No se cambia el logo oficial de F1 (hotlinked desde formula1.com) ni el
  favicon.
- No se cambian rutas, lógica de negocio de `F1ApiService` /
  `EstrategiasService`, ni modelos de datos.
- No se introducen nuevas dependencias de librería (el sistema de diseño se
  construye con SCSS + Angular Material theming existente).

## Testing

- El proyecto ya tiene cobertura Karma/Jasmine (umbral 70%/60%/50% en
  `karma.conf.js`) y accesibilidad ya trabajada en Fase 6. El plan de
  implementación deberá actualizar los tests existentes que dependan de la
  estructura actual de header/nav/footer por página (pasarán a vivir en
  `AppShellComponent`) y añadir tests para el nuevo servicio de estado de
  overlay y la directiva de scroll.
- Verificación visual manual (`ng serve`) en al menos: home completo, menú de
  navegación (desktop y viewport móvil `max-width: 500px`), y que el
  progress-bar siga funcionando tras retirar el script vanilla JS.
