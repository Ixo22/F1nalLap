import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  ConstructorStanding,
  ConstructorStandingsResponse,
  DriverStanding,
  DriverStandingsResponse,
  RaceResult,
  RaceScheduleEntry,
  RaceTableResponse,
} from '../models/f1-api.models';

/** Cliente único para la API pública de F1 (Ergast/jolpi.ca). */
@Injectable({ providedIn: 'root' })
export class F1ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.f1ApiBaseUrl;

  getDriverStandings(season: number | string): Observable<DriverStanding[]> {
    return this.http
      .get<DriverStandingsResponse>(`${this.baseUrl}/${season}/driverstandings.json`)
      .pipe(
        map((res) => res.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings ?? []),
        catchError(() => of([]))
      );
  }

  getConstructorStandings(season: number | string): Observable<ConstructorStanding[]> {
    return this.http
      .get<ConstructorStandingsResponse>(`${this.baseUrl}/${season}/constructorstandings.json`)
      .pipe(
        map((res) => res.MRData.StandingsTable.StandingsLists?.[0]?.ConstructorStandings ?? []),
        catchError(() => of([]))
      );
  }

  getSeasonSchedule(season: number | string): Observable<RaceScheduleEntry[]> {
    return this.http.get<RaceTableResponse>(`${this.baseUrl}/${season}.json`).pipe(
      map((res) => res.MRData.RaceTable.Races ?? []),
      catchError(() => of([]))
    );
  }

  getRaceResults(season: number | string, round: string | number): Observable<RaceResult[]> {
    return this.http
      .get<RaceTableResponse>(`${this.baseUrl}/${season}/${round}/results.json`)
      .pipe(
        map((res) => res.MRData.RaceTable.Races?.[0]?.Results ?? []),
        catchError(() => of([]))
      );
  }

  /** Ganador de cada carrera de la temporada (filtro de posición 1 de la API). */
  getSeasonWinners(season: number | string): Observable<RaceScheduleEntry[]> {
    return this.http.get<RaceTableResponse>(`${this.baseUrl}/${season}/results/1.json`).pipe(
      map((res) => res.MRData.RaceTable.Races ?? []),
      catchError(() => of([]))
    );
  }
}
