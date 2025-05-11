import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';
import { DialogSeasonResultsComponent } from '../../components/dialog-season-results/dialog-season-results.component';

type DriverRow = {
  position: string;
  piloto: string;
  constructor: string;
  points: string;
};
type TeamRow = { position: string; constructor: string; points: string };
type RaceRow = { round: string; race: string; date: string; winner: string };
type ResultadosRow = {
  raceName: string;
  position: string;
  grid: string;
  driver: string;
  constructor: string;
  fastestLapTime: string;
  points: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    RouterModule,
    MatMenuModule,
    CloseOtherMenusDirective,
    MatButtonModule,
    CommonModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatTableModule,
  ],
  templateUrl: './last-temps.component.html',
  styleUrls: ['./last-temps.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastTempsComponent {
  currentView = signal<'drivers' | 'teams' | 'races' | null>(null);
  temporadaControl = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1950),
    Validators.max(2025),
  ]);

  pilotos = signal<DriverRow[]>([]);
  equipos = signal<TeamRow[]>([]);
  carreras = signal<RaceRow[]>([]);
  resultado = signal<ResultadosRow[]>([]);

  displayedColumnsDrivers = ['position', 'piloto', 'constructor', 'points'];
  displayedColumnsTeams = ['position', 'constructor', 'points'];
  displayedColumnsRaces = ['round', 'race', 'date', 'winner'];

  constructor(private http: HttpClient) {}

  mostrarPilotos() {
    if (this.temporadaControl.invalid) return;
    const s = this.temporadaControl.value!;
    this.currentView.set('drivers');
    this.http
      .get<any>(`https://api.jolpi.ca/ergast/f1/${s}/driverstandings.json`)
      .subscribe((data) => {
        const list =
          data.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings || [];
        this.pilotos.set(
          list.map((d: any) => ({
            position: d.position,
            piloto: `${d.Driver.givenName} ${d.Driver.familyName}`,
            constructor: d.Constructors[0]?.name ?? '—',
            points: d.points,
          }))
        );
      });
  }

  mostrarEquipos() {
    if (this.temporadaControl.invalid) return;
    const s = this.temporadaControl.value!;
    this.currentView.set('teams');
    this.http
      .get<any>(`https://api.jolpi.ca/ergast/f1/${s}/constructorstandings.json`)
      .subscribe((data) => {
        const list =
          data.MRData.StandingsTable.StandingsLists?.[0]
            ?.ConstructorStandings || [];
        this.equipos.set(
          list.map((d: any) => ({
            position: d.position,
            constructor: d.Constructor.name ?? '—',
            points: d.points,
          }))
        );
      });
  }

  mostrarCarreras() {
    if (this.temporadaControl.invalid) return;
    const s = this.temporadaControl.value!;
    this.currentView.set('races');
    this.http
      .get<any>(`https://api.jolpi.ca/ergast/f1/${s}/results/1.json`)
      .subscribe((data) => {
        const raw = data.MRData.RaceTable.Races;
        const list = Array.isArray(raw) ? raw : [];
        this.carreras.set(
          list.map((d: any) => ({
            round: d.round,
            race: d.raceName ?? '—',
            date: d.date ?? '—',
            winner: d.Results?.[0]
              ? `${d.Results[0].Driver.givenName} ${d.Results[0].Driver.familyName}`
              : '—',
          }))
        );
      });
  }

  readonly dialog = inject(MatDialog);

  openDialog(round: string | null, race: string | null) {
    const overlayContainer = document.querySelector(
      '#progress-container'
    ) as HTMLElement;
    overlayContainer?.style.setProperty('z-index', '950', 'important');

    const ancho = document.querySelector(
      '.mat-dialog-container'
    ) as HTMLElement;
    ancho?.style.setProperty('max-width', '75%', 'important');
    this.http
      .get<any>(
        `https://api.jolpi.ca/ergast/f1/${this.temporadaControl.value}/${round}/results.json`
      )
      .subscribe((data) => {
        const raw = data.MRData.RaceTable.Races;
        const list = Array.isArray(raw) ? raw : [];

        const raceData = list.map((d: any) => ({
          raceName: d.raceName ?? '—',
          results:
            d.Results?.map((result: any) => ({
              position: result.position ?? '—',
              driver: `${result.Driver.givenName ?? '—'} ${
                result.Driver.familyName ?? '—'
              }`,
              constructor: result.Constructor.name ?? '—',
              fastestLapTime: result.FastestLap?.Time?.time ?? '—',
              points: result.points ?? '—',
            })) ?? [],
        }));

        const dialogRef = this.dialog.open(DialogSeasonResultsComponent, {
          data: {
            season: this.temporadaControl.value,
            round: round,
            race: race,
            raceData: raceData,
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          console.log(`Dialog result: ${result}`);
          overlayContainer?.style.removeProperty('z-index');
        });
      });
  }
}
