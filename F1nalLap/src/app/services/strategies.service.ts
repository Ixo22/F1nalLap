import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CircuitInfo } from '../models/circuit.models';
import {
  Compuesto,
  EstrategiaResultado,
  MejorEstrategiaResultado,
} from '../models/estrategia.models';

@Injectable({
  providedIn: 'root',
})
export class EstrategiasService {
  private vidaUtil: Record<Compuesto, number> = {
    blandos: 22,
    medios: 33,
    duros: 50,
  };

  private minimosVueltas: Record<Compuesto, [number, number]> = {
    blandos: [9, 15],
    medios: [15, 30],
    duros: [25, 40],
  };

  // Nota: la degradación final de "duros" ([0.15, 0.8]) es notablemente más
  // agresiva que la de su propia fase "media" ([0.09, 0.14]); revisar si es
  // intencional antes de tocar el modelo de simulación.
  private degradacionPorFase: Record<
    Compuesto,
    { inicial: [number, number]; media: [number, number]; final: [number, number] }
  > = {
    blandos: {
      inicial: [0.2, 0.25],
      media: [0.15, 0.2],
      final: [0.25, 0.3],
    },
    medios: {
      inicial: [0.15, 0.2],
      media: [0.13, 0.17],
      final: [0.18, 0.26],
    },
    duros: {
      inicial: [0.12, 0.16],
      media: [0.09, 0.14],
      final: [0.15, 0.8],
    },
  };

  private tiempoParada = 11.5;

  private calcularDegradacion(
    compuesto: Compuesto,
    vueltaActual: number,
    _vueltasTotales: number
  ): number {
    const vidaUtilMax = this.vidaUtil[compuesto];
    const vidaUtilPromedio = Math.floor(vidaUtilMax / 2);

    let fase: 'inicial' | 'media' | 'final';
    if (vueltaActual <= 5) {
      fase = 'inicial';
    } else if (vueltaActual <= vidaUtilPromedio && vueltaActual > 5) {
      fase = 'media';
    } else {
      fase = 'final';
    }
    const [min, max] = this.degradacionPorFase[compuesto][fase];
    return Math.random() * (max - min) + min;
  }

  private calcularTiempoStint(compuesto: Compuesto, vueltas: number, tiempoBase: number): number {
    let tiempoTotal = 0;
    for (let vuelta = 0; vuelta < vueltas; vuelta++) {
      const degradacion = this.calcularDegradacion(compuesto, vuelta, vueltas);
      tiempoTotal += tiempoBase + degradacion;
    }
    return tiempoTotal;
  }

  private ajustarCompuesto(compuesto: Compuesto, vueltas: number): Compuesto {
    if (compuesto === 'medios' && vueltas < 18) return 'blandos';
    if (compuesto === 'duros' && vueltas <= 25) return 'medios';
    return compuesto;
  }

  private calcularTiemposBase(circuito: CircuitInfo): Record<Compuesto, number> {
    const tiempoBaseBlandos = this.lapRecordToSeconds(circuito.lap_record);
    const tiempoBaseMedios = tiempoBaseBlandos + 0.9;
    const tiempoBaseDuros = tiempoBaseBlandos + 1.7;
    return {
      blandos: tiempoBaseBlandos,
      medios: tiempoBaseMedios,
      duros: tiempoBaseDuros,
    };
  }

  private lapRecordToSeconds(lapRecord: string): number {
    if (!lapRecord) return 0;
    const [min, sec] = lapRecord.split(':');
    return Number(min) * 60 + Number(sec.replace(',', '.'));
  }

  private generarEstrategias(vueltasTotales: number): [Compuesto, number][][] {
    const compuestos: Compuesto[] = ['blandos', 'medios', 'duros'];
    const estrategias: [Compuesto, number][][] = [];
    for (const compuesto1 of compuestos) {
      for (const compuesto2 of compuestos) {
        if (compuesto1 !== compuesto2) {
          for (
            let vueltas1 = this.minimosVueltas[compuesto1][0];
            vueltas1 <= Math.min(this.minimosVueltas[compuesto1][1], vueltasTotales);
            vueltas1++
          ) {
            const vueltas2 = vueltasTotales - vueltas1;
            if (
              vueltas2 >= this.minimosVueltas[compuesto2][0] &&
              vueltas2 <= this.minimosVueltas[compuesto2][1]
            ) {
              estrategias.push([
                [compuesto1, vueltas1],
                [compuesto2, vueltas2],
              ]);
            }
          }
        }
      }
    }
    for (const compuesto1 of compuestos) {
      for (const compuesto2 of compuestos) {
        if (compuesto1 !== compuesto2) {
          for (
            let vueltas1 = this.minimosVueltas[compuesto1][0];
            vueltas1 <= Math.min(this.minimosVueltas[compuesto1][1], vueltasTotales);
            vueltas1++
          ) {
            for (
              let vueltas2 = this.minimosVueltas[compuesto2][0];
              vueltas2 <= Math.min(this.minimosVueltas[compuesto2][1], vueltasTotales - vueltas1);
              vueltas2++
            ) {
              const vueltas3 = vueltasTotales - vueltas1 - vueltas2;
              if (
                vueltas3 >= this.minimosVueltas[compuesto2][0] &&
                vueltas3 <= this.minimosVueltas[compuesto2][1]
              ) {
                estrategias.push([
                  [compuesto1, vueltas1],
                  [compuesto2, vueltas2],
                  [compuesto2, vueltas3],
                ]);
              }
            }
          }
        }
      }
    }
    for (
      let vueltasBlando = this.minimosVueltas.blandos[0];
      vueltasBlando < Math.min(this.vidaUtil.blandos, vueltasTotales);
      vueltasBlando++
    ) {
      for (
        let vueltasMedio = this.minimosVueltas.medios[0];
        vueltasMedio < Math.min(this.vidaUtil.medios, vueltasTotales - vueltasBlando);
        vueltasMedio++
      ) {
        const vueltasDuro = vueltasTotales - vueltasBlando - vueltasMedio;
        if (vueltasDuro >= this.minimosVueltas.duros[0] && vueltasDuro <= this.vidaUtil.duros) {
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
    return estrategias;
  }

  private convertirTiempo(ms: number): string {
    const horas = Math.floor(ms / (60 * 60 * 1000));
    let msRestantes = ms % (60 * 60 * 1000);
    const minutos = Math.floor(msRestantes / (60 * 1000));
    msRestantes %= 60 * 1000;
    const segundos = Math.floor(msRestantes / 1000);
    const milisegundos = msRestantes % 1000;
    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${milisegundos.toString().padStart(3, '0')}`;
    } else {
      return `${minutos}:${segundos.toString().padStart(2, '0')}.${milisegundos.toString().padStart(3, '0')}`;
    }
  }

  private normalizarEstrategia(estrategia: [Compuesto, number][]): [Compuesto, number][] {
    const ordenCompuestos: Record<Compuesto, number> = { blandos: 1, medios: 2, duros: 3 };
    return [...estrategia].sort((a, b) => ordenCompuestos[a[0]] - ordenCompuestos[b[0]]);
  }

  private estrategiasDiferentes(
    estrategia1: [Compuesto, number][],
    estrategia2: [Compuesto, number][],
    umbralVueltas = 15
  ): boolean {
    const e1 = this.normalizarEstrategia(estrategia1);
    const e2 = this.normalizarEstrategia(estrategia2);
    if (e1.length !== e2.length) return true;
    for (let i = 0; i < e1.length; i++) {
      if (e1[i][0] !== e2[i][0]) return true;
      if (Math.abs(e1[i][1] - e2[i][1]) > umbralVueltas) return true;
    }
    return false;
  }

  /** Vida útil estimada (en vueltas) del compuesto antes de exponerse a la penalización por desgaste. */
  getVidaUtil(compuesto: Compuesto): number {
    return this.vidaUtil[compuesto];
  }

  /** Degradación (en segundos) de una vuelta concreta dentro de un stint, sin aplicar la
   *  penalización por superar la vida útil del compuesto. Usado por CircuitsComponent para
   *  dibujar la gráfica de degradación vuelta a vuelta. */
  calcularDegradacionPorVuelta(
    compuesto: Compuesto,
    vueltaActual: number,
    vueltasTotales: number
  ): number {
    return this.calcularDegradacion(compuesto, vueltaActual, vueltasTotales);
  }

  /**
   * Genera todas las estrategias legales (2 o 3 stints, mínimo dos compuestos distintos) para
   * las vueltas totales del circuito, las simula y devuelve las 3 mejores por tiempo total.
   * Si ninguna combinación es viable, devuelve un único elemento con `error`.
   */
  calcularMejoresEstrategias(circuito: CircuitInfo): MejorEstrategiaResultado[] {
    const vueltas = circuito.laps;
    const estrategias = this.generarEstrategias(vueltas);

    type MejorEstrategia = [number, number, [Compuesto, number][]];

    const mejoresEstrategias: MejorEstrategia[] = [];

    for (const estrategia of estrategias) {
      try {
        const [tiempo, estrategiaAjustadaActual] = this.simularEstrategia(circuito, estrategia);
        let penalizacion = 0;
        if (
          estrategiaAjustadaActual.length === 3 &&
          estrategiaAjustadaActual[0][0] === estrategiaAjustadaActual[1][0]
        ) {
          penalizacion = 50;
        }
        if (estrategiaAjustadaActual.length === 2) {
          penalizacion = -10;
        }
        mejoresEstrategias.push([tiempo + penalizacion, tiempo, estrategiaAjustadaActual]);
      } catch {
        continue;
      }
    }

    mejoresEstrategias.sort((a, b) => a[0] - b[0]);

    const estrategiasFiltradas: MejorEstrategia[] = [];
    for (const [ajustado, tiempoReal, estrategia] of mejoresEstrategias) {
      if (estrategiasFiltradas.every((e) => this.estrategiasDiferentes(estrategia, e[2]))) {
        estrategiasFiltradas.push([ajustado, tiempoReal, estrategia]);
      }
      if (estrategiasFiltradas.length === 3) break;
    }

    if (estrategiasFiltradas.length === 0) {
      return [
        { error: 'No se encontraron estrategias válidas para este circuito y configuración.' },
      ];
    } else {
      return estrategiasFiltradas.map(
        ([, tiempoReal, estrategiaAjustada], idx): EstrategiaResultado => ({
          estrategia: idx + 1,
          paradas: estrategiaAjustada.length - 1,
          stints: estrategiaAjustada.map((stint) => ({
            compuesto: stint[0],
            vueltas: stint[1],
          })),
          tiempo_total_segundos: Math.round(tiempoReal * 1000) / 1000,
          tiempo_formateado: isNaN(tiempoReal)
            ? 'N/A'
            : this.convertirTiempo(Math.floor(tiempoReal * 1000)),
        })
      );
    }
  }

  private simularEstrategia(
    circuito: CircuitInfo,
    estrategia: [Compuesto, number][]
  ): [number, [Compuesto, number][]] {
    let tiempoTotal = 0;
    const estrategiaAjustada: [Compuesto, number][] = [];
    const compuestosUsados = new Set<Compuesto>();
    const tiemposBase = this.calcularTiemposBase(circuito);

    for (const stint of estrategia) {
      const [compuesto, vueltas] = stint;
      const compuestoAjustado = this.ajustarCompuesto(compuesto, vueltas);
      if (vueltas > this.vidaUtil[compuestoAjustado]) {
        throw new Error(
          `El compuesto ${compuestoAjustado} no puede durar más de ${this.vidaUtil[compuestoAjustado]} vueltas.`
        );
      }
      const tiempoBase = tiemposBase[compuestoAjustado];
      const tiempoStint = this.calcularTiempoStint(compuestoAjustado, vueltas, tiempoBase);
      tiempoTotal += tiempoStint;
      tiempoTotal += this.tiempoParada;
      estrategiaAjustada.push([compuestoAjustado, vueltas]);
      compuestosUsados.add(compuestoAjustado);
    }
    if (compuestosUsados.size < 2) {
      throw new Error(
        'La estrategia no cumple con el reglamento: se deben usar al menos dos compuestos diferentes.'
      );
    }
    return [tiempoTotal - this.tiempoParada, estrategiaAjustada];
  }

  /**
   * Simula una estrategia armada libremente por el usuario (sin pasar por el filtro de
   * legalidad de `calcularMejoresEstrategias`). Si un stint supera la vida útil del compuesto,
   * cada vuelta de más aplica una penalización creciente (`0.5 + vueltasDeMas^1.5 * 1.5`) en vez
   * de la degradación normal por fase.
   */
  simularEstrategiaLibre(
    circuito: CircuitInfo,
    estrategia: [Compuesto, number][]
  ): Observable<EstrategiaResultado> {
    let tiempoTotal = 0;
    const tiemposBase = this.calcularTiemposBase(circuito);

    for (let i = 0; i < estrategia.length; i++) {
      const [compuesto, vueltas] = estrategia[i];
      const tiempoBase = tiemposBase[compuesto];
      let tiempoStint = 0;
      for (let vuelta = 0; vuelta < vueltas; vuelta++) {
        let degradacion: number;
        if (vuelta + 1 > this.vidaUtil[compuesto]) {
          const vueltasFueraVidaUtil = vuelta + 1 - this.vidaUtil[compuesto];
          degradacion = 0.5 + Math.pow(vueltasFueraVidaUtil, 1.5) * 1.5;
        } else {
          degradacion = this.calcularDegradacion(compuesto, vuelta, vueltas);
        }
        tiempoStint += tiempoBase + degradacion;
      }
      tiempoTotal += tiempoStint;
      if (i < estrategia.length - 1) {
        tiempoTotal += this.tiempoParada;
      }
    }

    return of({
      paradas: estrategia.length - 1,
      stints: estrategia.map((stint) => ({
        compuesto: stint[0],
        vueltas: stint[1],
      })),
      tiempo_total_segundos: Math.round(tiempoTotal * 1000) / 1000,
      tiempo_formateado: isNaN(tiempoTotal)
        ? 'N/A'
        : this.convertirTiempo(Math.floor(tiempoTotal * 1000)),
    });
  }

  getBestStrategies(circuito: CircuitInfo): Observable<MejorEstrategiaResultado[]> {
    const estrategias = this.calcularMejoresEstrategias(circuito);
    return of(estrategias);
  }
}
