import { Component, OnInit, ChangeDetectionStrategy, inject, signal, WritableSignal } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map, catchError, of, switchMap, forkJoin } from 'rxjs';

import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';
import teamsJson from '../../../assets/json/teams.json';
import circuitosJson from '../../../assets/json/circuitos2025.json';

const DRIVER_URL       = 'https://api.jolpi.ca/ergast/f1/2025/driverstandings.json';
const CONSTRUCTOR_URL  = 'https://api.jolpi.ca/ergast/f1/2025/constructorstandings.json';
const SEASON_RACES_URL = 'https://api.jolpi.ca/ergast/f1/2025/results/1.json';
const RACE_DETAILS_URL = (round: string) => `https://api.jolpi.ca/ergast/f1/2025/${round}/results.json`;

interface DisplayItem {
  position:    string;
  points:      string;
  wins?:       string;
  driverName?: string;
  teamName:    string;
  imageUrl?:   string;
  logoUrl?:    string;
}

interface PodiumEntry {
  position: string;
  driver:   string;
}

interface DisplayRace {
  round:        string;
  race:         string;
  date:         string;
  podium:       PodiumEntry[];
  circuitImage?: string;
}

interface CircuitInfo {
  id:         number;
  name:       string;
  image:      string;
  name_GP:    string;
  country:    string;
  laps:       number;
  length:     string;
  lap_record: string;
  circuitId:  string;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatButtonModule,
    MatTableModule,
    CloseOtherMenusDirective
  ],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingComponent implements OnInit {
  private http          = inject(HttpClient);
  private route         = inject(ActivatedRoute);

  private teamsData     = teamsJson.response as TeamResponse[];
  private circuitsData  = circuitosJson as CircuitInfo[];

  public items:     WritableSignal<DisplayItem[]> = signal([]);
  public carreras:  WritableSignal<DisplayRace[]>  = signal([]);
  public isDrivers: WritableSignal<boolean>        = signal(true);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      switch (params['view']) {
        case 'teams': this.loadTeams(); break;
        case 'races': this.loadRaces(); break;
        default:      this.loadDrivers();
      }
    });
  }

  loadDrivers() {
    this.isDrivers.set(true);
    this.carreras.set([]);
    this.http.get<DriverApiResponse>(DRIVER_URL).pipe(
      map(res => res.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings ?? []),
      map(list => list.map(ds => this.mapDriver(ds))),
      catchError(() => of([]))
    ).subscribe(data => this.items.set(data));
  }

  loadTeams() {
    this.isDrivers.set(false);
    this.carreras.set([]);
    this.http.get<ConstructorApiResponse>(CONSTRUCTOR_URL).pipe(
      map(res => res.MRData.StandingsTable.StandingsLists?.[0]?.ConstructorStandings ?? []),
      map(list => list.map(cs => this.mapConstructor(cs))),
      catchError(() => of([]))
    ).subscribe(data => this.items.set(data));
  }

  loadRaces() {
    this.isDrivers.set(false);
    this.items.set([]);

    this.http.get<RaceListApiResponse>(SEASON_RACES_URL).pipe(
      map(res => res.MRData.RaceTable.Races ?? []),
      switchMap(races => {
        const calls = races.map(race =>
          this.http.get<RaceListApiResponse>(RACE_DETAILS_URL(race.round)).pipe(
            map(det => det.MRData.RaceTable.Races?.[0]?.Results ?? []),
            map(results => results.slice(0, 3).map(rs => ({
              position: rs.position,
              driver:   `${rs.Driver.givenName} ${rs.Driver.familyName}`
            }))),
            catchError(() => of([] as PodiumEntry[]))
          )
        );
        return forkJoin(calls).pipe(
          map(podiums => races.map((race, idx) => {
            const circuitInfo = this.circuitsData.find(c => c.circuitId === race.Circuit.circuitId);
            return {
              round:        race.round,
              race:         race.raceName  ?? '—',
              date:         race.date      ?? '—',
              podium:       podiums[idx],
              circuitImage: circuitInfo?.image
            };
          }))
        );
      }),
      catchError(() => of([]))
    ).subscribe(data => this.carreras.set(data));
  }

  private mapDriver(ds: DriverStanding): DisplayItem {
    const family = ds.Driver.familyName;
    return {
      position:   ds.position,
      points:     ds.points,
      wins:       ds.wins,
      driverName: `${ds.Driver.givenName} ${family}`,
      teamName:   ds.Constructors[0]?.name ?? '—',
      imageUrl:   `https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/2025Drivers/${family}.jpg`
    };
  }

  private mapConstructor(cs: ConstructorStanding): DisplayItem {
    const name  = cs.Constructor.name;
    const match = this.teamsData.find(t => t.name === name || t.name.includes(name));
    return {
      position: cs.position,
      points:   cs.points,
      wins:     cs.wins,
      teamName: name,
      logoUrl:  match?.logo
    };
  }
}

interface DriverApiResponse { MRData: { StandingsTable: { StandingsLists: { DriverStandings: DriverStanding[] }[] } } }
interface DriverStanding { position: string; points: string; wins: string; Driver: { givenName: string; familyName: string }; Constructors: { name: string }[] }
interface ConstructorApiResponse { MRData: { StandingsTable: { StandingsLists: { ConstructorStandings: ConstructorStanding[] }[] } } }
interface ConstructorStanding { position: string; points: string; wins: string; Constructor: { name: string } }
interface RaceListApiResponse { MRData: { RaceTable: { Races: RaceEntry[] } } }
interface RaceEntry { round: string; raceName?: string; date?: string; Circuit: { circuitId: string }; Results?: RaceResult[] }
interface RaceResult { position: string; Driver: { givenName: string; familyName: string } }
interface TeamResponse { id: number; name: string; logo: string; pole_positions: number | null; fastest_laps: number | null }
interface CircuitInfo { id: number; name: string; image: string; name_GP: string; country: string; laps: number; length: string; lap_record: string; circuitId: string }