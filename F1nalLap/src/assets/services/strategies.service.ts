import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstrategiasService {
  // Datos de vida útil y degradación (en vueltas y segundos por vuelta)
  private vidaUtil = {
    blandos: 22,
    medios: 33,
    duros: 50
  };

  // Mínimos de vueltas por compuesto
  private minimosVueltas = {
    blandos: [9, 15],
    medios: [15, 30],
    duros: [25, 40]
  };

  // Degradación no lineal por fases para cada compuesto
  private degradacionPorFase = {
    blandos: {
      inicial: [0.1, 0.15],
      media: [0.05, 0.1],
      final: [0.15, 0.2]
    },
    medios: {
      inicial: [0.05, 0.1],
      media: [0.03, 0.07],
      final: [0.08, 0.16]
    },
    duros: {
      inicial: [0.03, 0.07],
      media: [0.02, 0.05],
      final: [0.05, 0.9]
    }
  };

  private tiempoParada = 22.5;

  private calcularDegradacion(compuesto: keyof typeof this.vidaUtil, vueltaActual: number, vueltasTotales: number): number {
    const vidaUtilMax = this.vidaUtil[compuesto];
    const vidaUtilPromedio = Math.floor(vidaUtilMax / 2);

    let fase: "inicial" | "media" | "final";
    if (vueltaActual <= 5) {
      fase = "inicial";
    } else if (vueltaActual <= vidaUtilPromedio && vueltaActual > 5) {
      fase = "media";
    } else {
      fase = "final";
    }
    const [min, max] = this.degradacionPorFase[compuesto][fase];
    return Math.random() * (max - min) + min;
  }

  private calcularTiempoStint(compuesto: keyof typeof this.vidaUtil, vueltas: number, tiempoBase: number): number {
    let tiempoTotal = 0;
    for (let vuelta = 0; vuelta < vueltas; vuelta++) {
      const degradacion = this.calcularDegradacion(compuesto, vuelta, vueltas);
      tiempoTotal += tiempoBase + degradacion;
    }
    return tiempoTotal;
  }

  private ajustarCompuesto(compuesto: keyof typeof this.vidaUtil, vueltas: number): keyof typeof this.vidaUtil {
    if (compuesto === "medios" && vueltas < 18) return "blandos";
    if (compuesto === "duros" && vueltas <= 25) return "medios";
    return compuesto;
  }

  private calcularTiemposBase(circuito: any) {
    const tiempoBaseBlandos = this.lapRecordToSeconds(circuito.lap_record);
    const tiempoBaseMedios = tiempoBaseBlandos + (78.918 - 78.149);
    const tiempoBaseDuros = tiempoBaseBlandos + (79.748 - 78.149);
    return {
      blandos: tiempoBaseBlandos,
      medios: tiempoBaseMedios,
      duros: tiempoBaseDuros
    };
  }

  private lapRecordToSeconds(lapRecord: string): number {
    // Ejemplo: "1:19.813" => 1*60 + 19.813 = 79.813
    if (!lapRecord) return 0;
    const [min, sec] = lapRecord.split(':');
    return Number(min) * 60 + Number(sec.replace(',', '.'));
  }

  private generarEstrategias(vueltasTotales: number): [keyof typeof this.vidaUtil, number][][] {
    const estrategias: [keyof typeof this.vidaUtil, number][][] = [];
    // Una parada
    for (const compuesto1 of Object.keys(this.vidaUtil) as (keyof typeof this.vidaUtil)[]) {
      for (const compuesto2 of Object.keys(this.vidaUtil) as (keyof typeof this.vidaUtil)[]) {
        if (compuesto1 !== compuesto2) {
          for (let vueltas1 = this.minimosVueltas[compuesto1 as keyof typeof this.minimosVueltas][0]; vueltas1 <= Math.min(this.minimosVueltas[compuesto1 as keyof typeof this.minimosVueltas][1], vueltasTotales); vueltas1++) {
            const vueltas2 = vueltasTotales - vueltas1;
            if (vueltas2 >= this.minimosVueltas[compuesto2 as keyof typeof this.minimosVueltas][0] && vueltas2 <= this.minimosVueltas[compuesto2 as keyof typeof this.minimosVueltas][1]) {
              estrategias.push([
                [compuesto1, vueltas1],
                [compuesto2, vueltas2]
              ]);
            }
          }
        }
      }
    }
    // Dos paradas
    for (const compuesto1 in this.vidaUtil) {
      for (const compuesto2 in this.vidaUtil) {
        if (compuesto1 !== compuesto2) {
          for (let vueltas1 = this.minimosVueltas[compuesto1 as keyof typeof this.minimosVueltas][0]; vueltas1 <= Math.min(this.minimosVueltas[compuesto1 as keyof typeof this.minimosVueltas][1], vueltasTotales); vueltas1++) {
            for (let vueltas2 = this.minimosVueltas[compuesto2 as keyof typeof this.minimosVueltas][0]; vueltas2 <= Math.min(this.minimosVueltas[compuesto2 as keyof typeof this.minimosVueltas][1], vueltasTotales - vueltas1); vueltas2++) {
              const vueltas3 = vueltasTotales - vueltas1 - vueltas2;
              if (vueltas3 >= this.minimosVueltas[compuesto2 as keyof typeof this.minimosVueltas][0] && vueltas3 <= this.minimosVueltas[compuesto2 as keyof typeof this.minimosVueltas][1]) {
                estrategias.push([
                  [compuesto1 as keyof typeof this.vidaUtil, vueltas1],
                  [compuesto2 as keyof typeof this.vidaUtil, vueltas2],
                  [compuesto2 as keyof typeof this.vidaUtil, vueltas3]
                ]);
              }
            }
          }
        }
      }
    }
    // Tres compuestos
    for (let vueltasBlando = this.minimosVueltas.blandos[0]; vueltasBlando < Math.min(this.vidaUtil.blandos, vueltasTotales); vueltasBlando++) {
      for (let vueltasMedio = this.minimosVueltas.medios[0]; vueltasMedio < Math.min(this.vidaUtil.medios, vueltasTotales - vueltasBlando); vueltasMedio++) {
        const vueltasDuro = vueltasTotales - vueltasBlando - vueltasMedio;
        if (vueltasDuro >= this.minimosVueltas.duros[0] && vueltasDuro <= this.vidaUtil.duros) {
          estrategias.push([
            ["blandos", vueltasBlando],
            ["medios", vueltasMedio],
            ["duros", vueltasDuro]
          ]);
        }
      }
    }
    if (estrategias.length === 0) {
      estrategias.push([
        ["blandos", Math.floor(vueltasTotales / 3)],
        ["medios", Math.floor(vueltasTotales / 3)],
        ["duros", vueltasTotales - 2 * Math.floor(vueltasTotales / 3)]
      ]);
    }
    return estrategias;
  }

  private convertirTiempo(ms: number): string {
    // ms: milisegundos
    const horas = Math.floor(ms / (60 * 60 * 1000));
    let msRestantes = ms % (60 * 60 * 1000);
    const minutos = Math.floor(msRestantes / (60 * 1000));
    msRestantes %= (60 * 1000);
    const segundos = Math.floor(msRestantes / 1000);
    const milisegundos = msRestantes % 1000;
    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${milisegundos.toString().padStart(3, '0')}`;
    } else {
      return `${minutos}:${segundos.toString().padStart(2, '0')}.${milisegundos.toString().padStart(3, '0')}`;
    }
  }

  private normalizarEstrategia(estrategia: [keyof typeof this.vidaUtil, number][]): [keyof typeof this.vidaUtil, number][] {
    const ordenCompuestos = { blandos: 1, medios: 2, duros: 3 };
    return [...estrategia].sort((a, b) => ordenCompuestos[a[0]] - ordenCompuestos[b[0]]);
  }

  private estrategiasDiferentes(estrategia1: [keyof typeof this.vidaUtil, number][], estrategia2: [keyof typeof this.vidaUtil, number][], umbralVueltas = 15): boolean {
    const e1 = this.normalizarEstrategia(estrategia1);
    const e2 = this.normalizarEstrategia(estrategia2);
    if (e1.length !== e2.length) return true;
    for (let i = 0; i < e1.length; i++) {
      if (e1[i][0] !== e2[i][0]) return true;
      if (Math.abs(e1[i][1] - e2[i][1]) > umbralVueltas) return true;
    }
    return false;
  }

  calcularMejoresEstrategias(circuito: any) {
    // Usa 'vueltas' o 'laps'
    const vueltas = circuito.vueltas ?? circuito.laps;
    const estrategias = this.generarEstrategias(vueltas);

    type MejorEstrategia = [number, number, [keyof typeof this.vidaUtil, number][]];

    const mejoresEstrategias: MejorEstrategia[] = [];

    for (const estrategia of estrategias) {
      try {
        const [tiempo, estrategiaAjustadaActual] = this.simularEstrategia(circuito, vueltas, estrategia);
        let penalizacion = 0;
        if (estrategiaAjustadaActual.length === 3 && estrategiaAjustadaActual[0][0] === estrategiaAjustadaActual[1][0]) {
          penalizacion = 60;
        }
        if (estrategiaAjustadaActual.length === 2) {
          penalizacion = -10;
        }
        mejoresEstrategias.push([tiempo + penalizacion, tiempo, estrategiaAjustadaActual]);
      } catch (e) {
        continue;
      }
    }

    mejoresEstrategias.sort((a, b) => a[0] - b[0]);

    const estrategiasFiltradas: MejorEstrategia[] = [];
    for (const [ajustado, tiempoReal, estrategia] of mejoresEstrategias) {
      if (estrategiasFiltradas.every(e => this.estrategiasDiferentes(estrategia, e[2]))) {
        estrategiasFiltradas.push([ajustado, tiempoReal, estrategia]);
      }
      if (estrategiasFiltradas.length === 3) break;
    }

    if (estrategiasFiltradas.length === 0) {
      return [{ error: "No se encontraron estrategias válidas para este circuito y configuración." }];
    } else {
      return estrategiasFiltradas.map(([_, tiempoReal, estrategiaAjustada], idx) => ({
        estrategia: idx + 1,
        paradas: estrategiaAjustada.length - 1,
        stints: estrategiaAjustada.map(stint => ({
          compuesto: stint[0],
          vueltas: stint[1]
        })),
        tiempo_total_segundos: Math.round(tiempoReal * 1000) / 1000,
        tiempo_formateado: isNaN(tiempoReal) ? 'N/A' : this.convertirTiempo(Math.floor(tiempoReal * 1000))
      }));
    }
  }

  private simularEstrategia(circuito: any, vueltasTotales: number, estrategia: [keyof typeof this.vidaUtil, number][]): [number, [keyof typeof this.vidaUtil, number][]] {
    let tiempoTotal = 0;
    const estrategiaAjustada: [keyof typeof this.vidaUtil, number][] = [];
    const compuestosUsados = new Set<keyof typeof this.vidaUtil>();
    const tiemposBase = this.calcularTiemposBase(circuito);

    for (const stint of estrategia) {
      let [compuesto, vueltas] = stint;
      const compuestoAjustado = this.ajustarCompuesto(compuesto, vueltas);
      if (vueltas > this.vidaUtil[compuestoAjustado]) {
        throw new Error(`El compuesto ${compuestoAjustado} no puede durar más de ${this.vidaUtil[compuestoAjustado]} vueltas.`);
      }
      const tiempoBase = tiemposBase[compuestoAjustado];
      const tiempoStint = this.calcularTiempoStint(compuestoAjustado, vueltas, tiempoBase);
      tiempoTotal += tiempoStint;
      tiempoTotal += this.tiempoParada;
      estrategiaAjustada.push([compuestoAjustado, vueltas]);
      compuestosUsados.add(compuestoAjustado);
    }
    if (compuestosUsados.size < 2) {
      throw new Error("La estrategia no cumple con el reglamento: se deben usar al menos dos compuestos diferentes.");
    }
    return [tiempoTotal - this.tiempoParada, estrategiaAjustada];
  }

  simularEstrategiaPersonalizada(
    circuito: any,
    estrategia: [keyof typeof this.vidaUtil, number][]
  ): Observable<any> {
    try {
      const [tiempo, estrategiaAjustada] = this.simularEstrategia(circuito, circuito.vueltas ?? circuito.laps, estrategia);
      return of({
        paradas: estrategiaAjustada.length - 1,
        stints: estrategiaAjustada.map(stint => ({
          compuesto: stint[0],
          vueltas: stint[1]
        })),
        tiempo_total_segundos: Math.round(tiempo * 1000) / 1000,
        tiempo_formateado: isNaN(tiempo) ? 'N/A' : this.convertirTiempo(Math.floor(tiempo * 1000))
      });
    } catch (e) {
      return of({ error: (e as Error).message });
    }
  }

  getBestStrategies(circuito: any): Observable<any[]> {
    // Calcula las 3 mejores estrategias reales para el circuito recibido
    const estrategias = this.calcularMejoresEstrategias(circuito);
    return of(estrategias);
  }
}