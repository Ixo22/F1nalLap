import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  ApiCircuit,
  ApiConstructorStanding,
  ApiDriverStanding,
  ApiRace,
  ApiRaceResults,
  ApiRaceWinner,
  ApiResult,
} from '../models/api.models';
import { CircuitInfo } from '../models/circuit.models';
import {
  ConstructorStanding,
  DriverStanding,
  RaceResult,
  RaceScheduleEntry,
} from '../models/f1-api.models';

/**
 * Cliente de la API propia (backend Spring Boot). Traduce sus respuestas a los modelos que ya
 * usaban los componentes, así que estos no necesitan saber de dónde vienen los datos.
 */
@Injectable({ providedIn: 'root' })
export class F1ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private circuits$?: Observable<CircuitInfo[]>;

  getDriverStandings(season: number | string): Observable<DriverStanding[]> {
    return this.get<ApiDriverStanding[]>(`/seasons/${season}/standings/drivers`).pipe(
      map((list) =>
        list.map((s) => ({
          position: s.position?.toString() ?? s.positionText,
          points: s.points.toString(),
          wins: s.wins.toString(),
          Driver: { givenName: s.driver.givenName, familyName: s.driver.familyName },
          Constructors: s.constructors.map((c) => ({ name: c.name })),
        }))
      )
    );
  }

  getConstructorStandings(season: number | string): Observable<ConstructorStanding[]> {
    return this.get<ApiConstructorStanding[]>(`/seasons/${season}/standings/constructors`).pipe(
      map((list) =>
        list.map((s) => ({
          position: s.position?.toString() ?? s.positionText,
          points: s.points.toString(),
          wins: s.wins.toString(),
          Constructor: { name: s.constructor.name },
        }))
      )
    );
  }

  getSeasonSchedule(season: number | string): Observable<RaceScheduleEntry[]> {
    return this.get<ApiRace[]>(`/seasons/${season}/races`).pipe(
      map((races) => races.map((r) => this.toScheduleEntry(r.round, r.name, r.date, r.circuitRef)))
    );
  }

  getRaceResults(season: number | string, round: string | number): Observable<RaceResult[]> {
    return this.get<ApiResult[]>(`/seasons/${season}/races/${round}/results`).pipe(
      map((results) => results.map((r) => this.toRaceResult(r)))
    );
  }

  /** Calendario con la clasificación de cada carrera en una sola petición. */
  getSeasonResults(season: number | string): Observable<RaceScheduleEntry[]> {
    return this.get<ApiRaceResults[]>(`/seasons/${season}/results`).pipe(
      map((races) =>
        races.map((r) => ({
          ...this.toScheduleEntry(r.round, r.name, r.date, r.circuitRef),
          Results: r.results.map((res) => this.toRaceResult(res)),
        }))
      )
    );
  }

  /** Ganador de cada carrera de la temporada. */
  getSeasonWinners(season: number | string): Observable<RaceScheduleEntry[]> {
    return this.get<ApiRaceWinner[]>(`/seasons/${season}/winners`).pipe(
      map((races) =>
        races.map((r) => ({
          ...this.toScheduleEntry(r.round, r.name, r.date, r.circuitRef),
          Results: [this.toRaceResult(r.winner)],
        }))
      )
    );
  }

  /** Circuitos del calendario. Se piden una vez y se reutilizan. */
  getCircuits(): Observable<CircuitInfo[]> {
    this.circuits$ ??= this.http.get<ApiCircuit[]>(`${this.baseUrl}/circuits`).pipe(
      map((list) => list.map((c) => toCircuitInfo(c))),
      catchError(() => {
        this.circuits$ = undefined;
        return of([]);
      }),
      shareReplay(1)
    );
    return this.circuits$;
  }

  private get<T extends unknown[]>(path: string): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${path}`)
      .pipe(catchError(() => of([] as unknown as T)));
  }

  private toScheduleEntry(
    round: number,
    name: string,
    date: string | null,
    circuitRef: string
  ): RaceScheduleEntry {
    return {
      round: round.toString(),
      raceName: name,
      date: date ?? undefined,
      Circuit: { circuitId: circuitRef },
    };
  }

  private toRaceResult(r: ApiResult): RaceResult {
    return {
      position: r.position.toString(),
      grid: r.grid?.toString(),
      points: r.points.toString(),
      Driver: { givenName: r.driver.givenName, familyName: r.driver.familyName },
      Constructor: { name: r.constructor.name },
      FastestLap: r.fastestLapTime ? { Time: { time: r.fastestLapTime } } : undefined,
    };
  }
}

export function toCircuitInfo(c: ApiCircuit): CircuitInfo {
  return {
    id: c.id,
    name: c.name,
    image: c.imageUrl,
    name_GP: c.grandPrixName,
    country: c.country,
    laps: c.laps,
    length: `${c.lengthKm.toFixed(3)} km`,
    lap_record: formatLapRecord(c.lapRecordMs),
    circuitId: c.circuitRef,
  };
}

/** 79813 -> "1:19.813" */
export function formatLapRecord(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}
