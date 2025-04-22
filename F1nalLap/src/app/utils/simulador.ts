// -------------------- Datos base --------------------
//Vida útil máxima estimada para cada compuesto (en vueltas)
export const vidaUtil: Record<string, number> = {
  blandos: 22,
  medios: 33,
  duros: 50,
};

// Mínimos de vueltas por compuesto estimados (en vueltas)
export const minimosVueltas: Record<string, [number, number]> = {
  blandos: [9, 15],
  medios: [15, 30],
  duros: [25, 40],
};

// Degradación no lineal por fases para cada compuesto
export const degradacionPorFase: Record<
  string,
  {
    inicial: [number, number]; // Degradación en las primeras 5 vueltas
    media: [number, number]; // Degradación en las vueltas intermedias
    final: [number, number]; // Degradación en las últimas vueltas
  }
> = {
  blandos: {
    inicial: [0.1, 0.15],
    media: [0.05, 0.1],
    final: [0.15, 0.2],
  },
  medios: {
    inicial: [0.05, 0.1],
    media: [0.03, 0.07],
    final: [0.08, 0.16],
  },
  duros: {
    inicial: [0.03, 0.07],
    media: [0.02, 0.05],
    final: [0.05, 0.9],
  },
};


// Tiempo estimado de parada en boxes (en segundos)
export const tiempoParada = 22.5;


// -------------------- Funciones base --------------------
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Función para calcular la degradación por vuelta según la fase
export function calcularDegradacion(
  compuesto: string, // Compuesto: Tipo de neumático (blandos, medios, duros).
  vueltaActual: number, // Vuelta actual: Número de la vuelta actual.
  vueltasTotales: number // Vueltas Totales: Número total de vueltas del stint.
): number {
  const vidaMax = vidaUtil[compuesto];
  const vidaMedia = Math.floor(vidaMax / 2);
  let degradacion: [number, number];

  // Determinar la fase actual
  if (vueltaActual <= 5) { //  Fase inicial (primeras 5 vueltas)
    degradacion = degradacionPorFase[compuesto].inicial;
  } else if (vueltaActual <= vidaMedia) { // Fase media (vueltas intermedias)
    degradacion = degradacionPorFase[compuesto].media;
  } else { // Fase final (últimas vueltas)
    degradacion = degradacionPorFase[compuesto].final;
  }

  // Calcular degradación aleatoria dentro del rango de la fase
  return randomInRange(degradacion[0], degradacion[1]);
}

// Función para calcular el tiempo total de un stint
export function calcularTiempoStint(
  compuesto: string,
  vueltas: number,
  tiempoBase: number
): number {
  let tiempoTotal = 0;
  for (let i = 0; i < vueltas; i++) {
    const degradacion = calcularDegradacion(compuesto, i, vueltas);
    tiempoTotal += tiempoBase + degradacion;
  }
  return tiempoTotal;
}

// Función para ajustar el compuesto según las condiciones
export function ajustarCompuesto(compuesto: string, vueltas: number): string {
  if (compuesto === 'medios' && vueltas < 18) return 'blandos';
  if (compuesto === 'duros' && vueltas <= 25) return 'medios';
  return compuesto;
}

// -------------------- Estrategias --------------------
export function simularEstrategia(
  estrategia: [string, number][],
  tiempoBase: number
): number {
  let tiempoTotal = 0;
  for (const [compuestoOriginal, vueltas] of estrategia) {
    const compuesto = ajustarCompuesto(compuestoOriginal, vueltas);
    tiempoTotal += calcularTiempoStint(compuesto, vueltas, tiempoBase);
  }
  tiempoTotal += (estrategia.length - 1) * tiempoParada;
  return tiempoTotal;
}

export function generarEstrategias(
  vueltasTotales: number
): [string, number][][] {
  const estrategias: [string, number][][] = [];
  const compuestos = ['blandos', 'medios', 'duros'];

  for (const compuesto1 of compuestos) {
    for (const compuesto2 of compuestos) {
      for (
        let stint1 = minimosVueltas[compuesto1][0];
        stint1 <= minimosVueltas[compuesto1][1];
        stint1++
      ) {
        let stint2 = vueltasTotales - stint1;
        if (
          stint2 >= minimosVueltas[compuesto2][0] &&
          stint2 <= minimosVueltas[compuesto2][1]
        ) {
          estrategias.push([
            [compuesto1, stint1],
            [compuesto2, stint2],
          ]);
        }
      }
    }
  }

  return estrategias;
}

// -------------------- Comparar estrategias --------------------
export function compararEstrategias(
  estrategias: [string, number][][],
  tiempoBase: number
): { estrategia: [string, number][]; tiempo: number }[] {
  const resultados: { estrategia: [string, number][]; tiempo: number }[] = [];

  for (const estrategia of estrategias) {
    const tiempo = simularEstrategia(estrategia, tiempoBase);
    resultados.push({ estrategia, tiempo });
  }

  resultados.sort((a, b) => a.tiempo - b.tiempo);
  return resultados;
}

// -------------------- Utilidad para mostrar --------------------
export function formatearEstrategia(estrategia: [string, number][]): string {
  return estrategia.map(([comp, vuelt]) => `${comp} (${vuelt})`).join(' ➝ ');
}
