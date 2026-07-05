# F1nalLap — documentación técnica

Aplicación Angular que consume la API pública de Fórmula 1 [Ergast/jolpi.ca](https://api.jolpi.ca/ergast/) para mostrar clasificaciones, calendario, resultados y comparativas de pilotos/equipos, además de un simulador de estrategias de neumáticos. La descripción del producto está en el [README de la raíz del repositorio](../README.md); este documento cubre cómo desarrollar y mantener el proyecto.

## Requisitos

- Node.js 20+ y npm.
- Angular CLI (`npm install -g @angular/cli`), opcional si usas `npx`.

## Puesta en marcha

```bash
npm install
npm start        # ng serve, http://localhost:4200
```

## Arquitectura

- **Componentes de página** (`src/app/pages/`): standalone, uno por ruta (`home`, `temp-actual`, `last-temps`, `memorable-temps`, `circuits`, `ranking`, `comparar`). Lazy-loaded desde `app.routes.ts`.
- **`F1ApiService`** (`src/app/services/f1-api.service.ts`): único punto de acceso a la API de Ergast/jolpi.ca (clasificaciones, calendario, resultados de carrera). Todas las peticiones capturan errores de red y resuelven a un array vacío en vez de propagar la excepción.
- **`EstrategiasService`** (`src/app/services/strategies.service.ts`): lógica pura del simulador de estrategias de neumáticos (degradación por compuesto y fase, generación y comparación de estrategias válidas para un circuito).
- **Modelos** (`src/app/models/`): tipos compartidos de la respuesta de la API (`f1-api.models.ts`), del dominio del simulador (`estrategia.models.ts`), de los circuitos (`circuit.models.ts`) y de los datos que reciben los diálogos de resultados (`dialog.models.ts`).
- **`src/environments/`**: `environment.ts` (desarrollo) y `environment.prod.ts` (producción, activado vía `fileReplacements` en `angular.json`). Ahí vive `f1ApiBaseUrl`, la única configuración de entorno del proyecto.

## Dependencia de la API externa

Toda la app depende de `https://api.jolpi.ca/ergast/f1` (un espejo público y gratuito de la histórica API de Ergast). No requiere API key, pero tampoco documenta límites de rate de forma oficial ni ofrece SLA — si empieza a devolver errores o va lento, no hay nada que se pueda hacer del lado de la app salvo lo que ya hace `F1ApiService` (degradar a lista vacía). No hay caché de respuestas: cada vez que se entra en una vista se repite la petición.

## Scripts disponibles

| Comando         | Qué hace                                         |
| --------------- | ------------------------------------------------ |
| `npm start`     | Servidor de desarrollo (`ng serve`)              |
| `npm run build` | Build de producción en `dist/f1nal-lap`          |
| `npm test`      | Tests unitarios con Karma/Jasmine                |
| `npm run lint`  | ESLint (`@angular-eslint`) sobre `.ts` y `.html` |

Para cobertura de tests: `ng test --code-coverage` (reporte HTML en `coverage/f1nal-lap/`). El umbral mínimo configurado en `karma.conf.js` es 70% de statements/lines, 60% de funciones y 50% de ramas — `ng test` falla si no se cumple.

## Calidad de código

- **ESLint + Prettier**: configurados en `eslint.config.js` / `.prettierrc.json`.
- **Husky + lint-staged**: hook de pre-commit que corre `eslint --fix` y `prettier --write` sobre los ficheros en stage. El hook vive en `.husky/` en la raíz del repositorio (el proyecto Angular está en un subdirectorio), y se instala automáticamente al hacer `npm install` (script `prepare`).

## CI

`.github/workflows/ci.yml` corre en cada push/PR contra `main`: instalación, lint, tests con cobertura y build de producción.

## Despliegue

Netlify construye con `ng build --configuration production` y publica `dist/f1nal-lap/browser` (ver `netlify.toml` en la raíz del repositorio). El proyecto no usa SSR: todo es un SPA estático.

## Simulador de estrategias

`EstrategiasService` modela tres compuestos de neumático (`blandos`, `medios`, `duros`), cada uno con una vida útil máxima y una degradación por vuelta que varía según la fase del stint (inicial / media / final). Dado un circuito:

- `calcularMejoresEstrategias` genera todas las combinaciones de 2 o 3 stints que sean legales (mínimo de vueltas por compuesto, al menos dos compuestos distintos) y devuelve las 3 mejores por tiempo total simulado, o un resultado de error si ninguna es viable para ese número de vueltas.
- `simularEstrategiaLibre` calcula el tiempo total de una estrategia que arma el propio usuario en la pantalla de simulador, aplicando una penalización de degradación agresiva si algún stint supera la vida útil del compuesto elegido.

Los valores de vida útil y rangos de degradación por fase son estimaciones manuales (no proceden de datos reales de neumáticos), documentadas como constantes en la parte superior de `strategies.service.ts`.
