import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { ApiCompound, ApiDegradation, ApiStint, ApiStrategyResult } from '../models/api.models';
import { CircuitInfo } from '../models/circuit.models';
import {
  Compuesto,
  EstrategiaResultado,
  MejorEstrategiaResultado,
} from '../models/estrategia.models';

/** Punto de la gráfica de degradación de un stint. */
export interface DegradacionPunto {
  vuelta: number;
  value: number;
  fase: 'inicial' | 'media' | 'final';
}

const A_API: Record<Compuesto, ApiCompound> = { blandos: 'SOFT', medios: 'MEDIUM', duros: 'HARD' };
const DESDE_API: Record<ApiCompound, Compuesto> = {
  SOFT: 'blandos',
  MEDIUM: 'medios',
  HARD: 'duros',
};
const FASES: Record<ApiDegradation['laps'][number]['phase'], DegradacionPunto['fase']> = {
  INITIAL: 'inicial',
  MIDDLE: 'media',
  END: 'final',
};
const SIN_ESTRATEGIAS = 'No se encontraron estrategias válidas para este circuito y configuración.';

/**
 * Cliente del simulador de estrategias. La simulación se ejecuta en el backend (Java),
 * que es determinista: el mismo circuito devuelve siempre el mismo resultado.
 */
@Injectable({ providedIn: 'root' })
export class EstrategiasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/circuits`;

  /** Las 3 mejores estrategias. Si no hay ninguna, devuelve un único elemento con `error`. */
  getBestStrategies(circuito: CircuitInfo): Observable<MejorEstrategiaResultado[]> {
    return this.http
      .get<ApiStrategyResult[]>(`${this.baseUrl}/${circuito.circuitId}/strategies/best`)
      .pipe(
        map((list) =>
          list.length === 0 ? [{ error: SIN_ESTRATEGIAS }] : list.map((r) => this.toResultado(r))
        ),
        catchError(() => of([{ error: SIN_ESTRATEGIAS }]))
      );
  }

  /** Simula una estrategia libre definida por el usuario. */
  simularEstrategiaLibre(
    circuito: CircuitInfo,
    estrategia: [Compuesto, number][]
  ): Observable<EstrategiaResultado> {
    const stints: ApiStint[] = estrategia.map(([compuesto, vueltas]) => ({
      compound: A_API[compuesto],
      laps: vueltas,
    }));
    return this.http
      .post<ApiStrategyResult>(`${this.baseUrl}/${circuito.circuitId}/strategies/simulate`, {
        stints,
      })
      .pipe(map((r) => this.toResultado(r)));
  }

  /** Degradación vuelta a vuelta de un stint (incluye la penalización por superar la vida útil). */
  getDegradacionStint(
    circuito: CircuitInfo,
    compuesto: Compuesto,
    vueltas: number
  ): Observable<DegradacionPunto[]> {
    return this.http
      .get<ApiDegradation>(`${this.baseUrl}/${circuito.circuitId}/degradation`, {
        params: { compound: A_API[compuesto], laps: vueltas },
      })
      .pipe(
        map((d) =>
          d.laps.map((p) => ({ vuelta: p.lap, value: p.degradationSeconds, fase: FASES[p.phase] }))
        ),
        catchError(() => of([]))
      );
  }

  private toResultado(r: ApiStrategyResult): EstrategiaResultado {
    return {
      ...(r.rank !== null ? { estrategia: r.rank } : {}),
      paradas: r.stops,
      stints: r.stints.map((s) => ({ compuesto: DESDE_API[s.compound], vueltas: s.laps })),
      tiempo_total_segundos: r.totalTimeSeconds,
      tiempo_formateado: r.formattedTime,
    };
  }
}
