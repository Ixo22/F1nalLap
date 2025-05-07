import { Component } from '@angular/core';
import { RouterModule }     from '@angular/router';
import { MatMenuModule }    from '@angular/material/menu';
import { MatButtonModule }  from '@angular/material/button';

import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component'

import { MatSlideToggleModule } from '@angular/material/slide-toggle';


import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, inject, signal, WritableSignal  } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';

import { OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import teamsJson from '../../../assets/json/teams.json';
const DRIVER_URL      = 'https://api.jolpi.ca/ergast/f1/2025/driverstandings.json';
const CONSTRUCTOR_URL = 'https://api.jolpi.ca/ergast/f1/2025/constructorstandings.json';

interface DisplayItem {
  position:    string;
  points:      string;
  wins?:       string;
  driverName?: string;
  teamName:    string;
  imageUrl?:   string;
  logoUrl?:    string;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    RouterModule,
    MatMenuModule,
    CloseOtherMenusDirective,
    MatButtonModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingComponent implements OnInit{
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  private teamsData: TeamResponse[] = teamsJson.response;

  public items:     WritableSignal<DisplayItem[]> = signal([]);
  public isDrivers: WritableSignal<boolean>       = signal(true);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // Si view==='teams' carga equipos, en otro caso, pilotos
      if (params['view'] === 'teams') {
        this.loadTeams();
      } else {
        this.loadDrivers();
      }
    });
  }

  loadDrivers() {
    this.isDrivers.set(true);
    this.http.get<DriverApiResponse>(DRIVER_URL).pipe(
      map(res => {
        const list = res.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings ?? [];
        return list.map(ds => this.mapDriver(ds));
      }),
      catchError(() => of([]))
    )
    .subscribe(data => this.items.set(data));
  }

  loadTeams() {
    this.isDrivers.set(false);
    this.http.get<ConstructorApiResponse>(CONSTRUCTOR_URL).pipe(
      map(res => {
        const list = res.MRData.StandingsTable.StandingsLists?.[0]?.ConstructorStandings ?? [];
        return list.map(cs => this.mapConstructor(cs));
      }),
      catchError(() => of([]))
    )
    .subscribe(data => this.items.set(data));
  }

  private mapDriver(ds: DriverStanding): DisplayItem {
    const family = ds.Driver.familyName;
    let team = ds.Constructors[0]?.name ?? '—';

    const imageUrl = `https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/` +
                     `content/dam/fom-website/drivers/2025Drivers/${family}.jpg`;

    return {
      position:    ds.position,
      points:      ds.points,
      wins:        ds.wins,
      driverName: `${ds.Driver.givenName} ${family}`,
      teamName:    team,
      imageUrl
    };
  }

  private mapConstructor(cs: ConstructorStanding): DisplayItem {
    const name     = cs.Constructor.name;
    let teamName   = name;

    // Buscamos en teamsData por id o nombre
    const match = this.teamsData.find(t =>
      t.name === name || t.name.includes(name)
    );

    return {
      position: cs.position,
      points:   cs.points,
      wins:     cs.wins,
      teamName,
      logoUrl:  match?.logo
    };
  }
}

/** Tipados Ergast */
interface DriverApiResponse {
  MRData: { StandingsTable: { StandingsLists: { DriverStandings: DriverStanding[] }[] } };
}
interface DriverStanding {
  position: string; points: string; wins: string;
  Driver: { givenName: string; familyName: string };
  Constructors: { name: string }[];
}
interface ConstructorApiResponse {
  MRData: { StandingsTable: { StandingsLists: { ConstructorStandings: ConstructorStanding[] }[] } };
}
interface ConstructorStanding {
  position: string; points: string; wins: string;
  Constructor: { name: string };
}

/** Tipados teams.json */
interface TeamsJson {
  response: TeamResponse[];
}
interface TeamResponse {
  id:             number;
  name:           string;
  logo:           string;
  pole_positions: number | null;
  fastest_laps:   number | null;
}