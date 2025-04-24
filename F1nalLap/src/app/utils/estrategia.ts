export type Compuesto = 'blandos' | 'medios' | 'duros';

export const VIDA_UTIL: Record<Compuesto, number> = {
  blandos: 22,
  medios: 33,
  duros: 50,
};

export const MINIMOS_VUELTAS: Record<Compuesto, [number, number]> = {
  blandos: [9, 15],
  medios: [15, 26],
  duros: [30, 40],
};

export const DEGRADACION_POR_FASE: Record<
  Compuesto,
  Record<'inicial' | 'media' | 'final', [number, number]>
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

export const TIEMPO_PARADA = 22.5;

function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function calcularDegradacion(
  compuesto: Compuesto,
  vueltaActual: number,
  vueltasTotales: number
): number {
  const vidaUtilMax = VIDA_UTIL[compuesto];
  const vidaUtilPromedio = Math.floor(vidaUtilMax / 2);

  let fase: 'inicial' | 'media' | 'final';
  if (vueltaActual <= 5) {
    fase = 'inicial';
  } else if (vueltaActual <= vidaUtilPromedio) {
    fase = 'media';
  } else {
    fase = 'final';
  }

  const [min, max] = DEGRADACION_POR_FASE[compuesto][fase];
  return getRandomInRange(min, max);
}

export function calcularTiempoStint(
  compuesto: Compuesto,
  vueltas: number,
  tiempoBase: number
): number {
  let tiempoTotal = 0;
  for (let vuelta = 0; vuelta < vueltas; vuelta++) {
    const degradacion = calcularDegradacion(compuesto, vuelta, vueltas);
    tiempoTotal += tiempoBase + degradacion;
  }
  return tiempoTotal;
}

export function ajustarCompuesto(
  compuesto: Compuesto,
  vueltas: number
): Compuesto {
  if (compuesto === 'medios' && vueltas < 18) return 'blandos';
  if (compuesto === 'duros' && vueltas <= 25) return 'medios';
  return compuesto;
}

export function calcularTiemposBase(circuito: {
  tiempo_inicial: number;
}): Record<Compuesto, number> {
  const tiempoBaseBlandos = circuito.tiempo_inicial;
  return {
    blandos: tiempoBaseBlandos,
    medios: tiempoBaseBlandos + (78.918 - 78.149),
    duros: tiempoBaseBlandos + (79.748 - 78.149),
  };
}


export function convertirTiempo(ms: number): string {
  const horas = Math.floor(ms / 3600000);
  let resto = ms % 3600000;
  const minutos = Math.floor(resto / 60000);
  resto %= 60000;
  const segundos = Math.floor(resto / 1000);
  const milisegundos = Math.floor(resto % 1000); // Redondear milisegundos a 3 dígitos

  return horas > 0
    ? `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${milisegundos.toString().padStart(3, '0')}`
    : `${minutos}:${segundos.toString().padStart(2, '0')}.${milisegundos.toString().padStart(3, '0')}`;
}


export function formatearEstrategia(estrategia: [Compuesto, number][]): string {
  const salida: string[] = [];
  let vueltasAcumuladas = 0;

  for (const [compuesto, vueltas] of estrategia) {
    const inicio = vueltasAcumuladas + 1;
    const fin = vueltasAcumuladas + vueltas;
    salida.push(
      `${
        compuesto.charAt(0).toUpperCase() + compuesto.slice(1)
      }, Usar entre la vuelta ${inicio} y ${fin}`
    );
    vueltasAcumuladas += vueltas;
  }

  return `${estrategia.length - 1} paradas -> ` + salida.join(' -> ');
}

export function normalizarEstrategia(
  estrategia: [Compuesto, number][]
): [Compuesto, number][] {
  const ordenCompuestos: Record<Compuesto, number> = {
    blandos: 1,
    medios: 2,
    duros: 3,
  };
  return [...estrategia].sort(
    (a, b) => ordenCompuestos[a[0]] - ordenCompuestos[b[0]]
  );
}

export function estrategiasDiferentes(
  estrategia1: [Compuesto, number][],
  estrategia2: [Compuesto, number][],
  umbralVueltas = 15
): boolean {
  const est1 = normalizarEstrategia(estrategia1);
  const est2 = normalizarEstrategia(estrategia2);

  if (est1.length !== est2.length) return true;

  for (let i = 0; i < est1.length; i++) {
    const [comp1, vueltas1] = est1[i];
    const [comp2, vueltas2] = est2[i];
    if (comp1 !== comp2 || Math.abs(vueltas1 - vueltas2) > umbralVueltas)
      return true;
  }

  return false;
}



export function simularEstrategia(
  circuito: { tiempo_inicial: number },
  vueltasTotales: number,
  estrategia: [Compuesto, number][]
): [number, [Compuesto, number][]] {
  let tiempoTotal = 0;
  const estrategiaAjustada: [Compuesto, number][] = [];
  const compuestosUsados = new Set<Compuesto>();

  const tiemposBase = calcularTiemposBase(circuito);

  for (const [compuesto, vueltas] of estrategia) {
    const compuestoAjustado = ajustarCompuesto(compuesto, vueltas);
    if (vueltas > VIDA_UTIL[compuestoAjustado]) {
      throw new Error(
        `El compuesto ${compuestoAjustado} no puede durar más de ${VIDA_UTIL[compuestoAjustado]} vueltas.`
      );
    }

    const tiempoBase = tiemposBase[compuestoAjustado];
    const tiempoStint = calcularTiempoStint(
      compuestoAjustado,
      vueltas,
      tiempoBase
    );
    tiempoTotal += tiempoStint + TIEMPO_PARADA;
    estrategiaAjustada.push([compuestoAjustado, vueltas]);
    compuestosUsados.add(compuestoAjustado);
  }

  if (compuestosUsados.size < 2) {
    throw new Error(
      'La estrategia no cumple con el reglamento: se deben usar al menos dos compuestos diferentes.'
    );
  }

  return [tiempoTotal - TIEMPO_PARADA, estrategiaAjustada];
}

export function generarEstrategias(
  vueltasTotales: number
): [Compuesto, number][][] {
  const estrategias: [Compuesto, number][][] = [];

  for (const compuesto1 in VIDA_UTIL) {
    for (const compuesto2 in VIDA_UTIL) {
      if (compuesto1 !== compuesto2) {
        for (
          let vueltas1 = MINIMOS_VUELTAS[compuesto1 as Compuesto][0];
          vueltas1 <=
          Math.min(MINIMOS_VUELTAS[compuesto1 as Compuesto][1], vueltasTotales);
          vueltas1++
        ) {
          const vueltas2 = vueltasTotales - vueltas1;
          if (
            vueltas2 >= MINIMOS_VUELTAS[compuesto2 as Compuesto][0] &&
            vueltas2 <= MINIMOS_VUELTAS[compuesto2 as Compuesto][1]
          ) {
            estrategias.push([
              [compuesto1 as Compuesto, vueltas1],
              [compuesto2 as Compuesto, vueltas2],
            ]);
          }
        }
      }
    }
  }

  for (const compuesto1 in VIDA_UTIL) {
    for (const compuesto2 in VIDA_UTIL) {
      if (compuesto1 !== compuesto2) {
        for (
          let vueltas1 = MINIMOS_VUELTAS[compuesto1 as Compuesto][0];
          vueltas1 <=
          Math.min(MINIMOS_VUELTAS[compuesto1 as Compuesto][1], vueltasTotales);
          vueltas1++
        ) {
          for (
            let vueltas2 = MINIMOS_VUELTAS[compuesto2 as Compuesto][0];
            vueltas2 <=
            Math.min(
              MINIMOS_VUELTAS[compuesto2 as Compuesto][1],
              vueltasTotales - vueltas1
            );
            vueltas2++
          ) {
            const vueltas3 = vueltasTotales - vueltas1 - vueltas2;
            if (
              vueltas3 >= MINIMOS_VUELTAS[compuesto2 as Compuesto][0] &&
              vueltas3 <= MINIMOS_VUELTAS[compuesto2 as Compuesto][1]
            ) {
              estrategias.push([
                [compuesto1 as Compuesto, vueltas1],
                [compuesto2 as Compuesto, vueltas2],
                [compuesto2 as Compuesto, vueltas3],
              ]);
            }
          }
        }
      }
    }
  }

  for (
    let vueltasBlando = MINIMOS_VUELTAS['blandos'][0];
    vueltasBlando < Math.min(VIDA_UTIL['blandos'], vueltasTotales);
    vueltasBlando++
  ) {
    for (
      let vueltasMedio = MINIMOS_VUELTAS['medios'][0];
      vueltasMedio <
      Math.min(VIDA_UTIL['medios'], vueltasTotales - vueltasBlando);
      vueltasMedio++
    ) {
      const vueltasDuro = vueltasTotales - vueltasBlando - vueltasMedio;
      if (
        vueltasDuro >= MINIMOS_VUELTAS['duros'][0] &&
        vueltasDuro <= VIDA_UTIL['duros']
      ) {
        estrategias.push([
          ['blandos', vueltasBlando],
          ['medios', vueltasMedio],
          ['duros', vueltasDuro],
        ]);
      }
    }
  }

  if (estrategias.length === 0) {
    estrategias.push([
      ['blandos', Math.floor(vueltasTotales / 3)],
      ['medios', Math.floor(vueltasTotales / 3)],
      ['duros', vueltasTotales - 2 * Math.floor(vueltasTotales / 3)],
    ]);
  }

  const estrategiasUnicas: [Compuesto, number][][] = [];

  for (const nueva of estrategias) {
    const yaExiste = estrategiasUnicas.some(
      (existente) => estrategiasEquivalentes(nueva, existente, 8) // La tolerancia es de 8 vueltas
    );

    if (!yaExiste) {
      estrategiasUnicas.push(nueva);
    }
  }

  return estrategiasUnicas;
}

// Normaliza las estrategias antes de compararlas para que no importe el orden de los compuestos
export function estrategiasEquivalentes(
  est1: [Compuesto, number][],
  est2: [Compuesto, number][],
  toleranciaVueltas = 8
): boolean {
  // Normalizamos las estrategias antes de compararlas
  const est1Normalizada = normalizarEstrategia(est1);
  const est2Normalizada = normalizarEstrategia(est2);

  // Comprobamos si tienen la misma longitud
  if (est1Normalizada.length !== est2Normalizada.length) return false;

  // Comparamos las estrategias normalizadas
  for (let i = 0; i < est1Normalizada.length; i++) {
    const [comp1, vueltas1] = est1Normalizada[i];
    const [comp2, vueltas2] = est2Normalizada[i];
    if (comp1 !== comp2 || Math.abs(vueltas1 - vueltas2) > toleranciaVueltas) {
      return false;
    }
  }

  return true;
}



