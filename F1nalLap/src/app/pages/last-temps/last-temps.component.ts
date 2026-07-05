import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

import { MatDialog } from '@angular/material/dialog';
import { DialogSeasonResultsComponent } from '../../components/dialog-season-results/dialog-season-results.component';
import { F1ApiService } from '../../services/f1-api.service';

interface DriverRow {
  position: string;
  piloto: string;
  constructor: string;
  points: string;
}
interface TeamRow {
  position: string;
  constructor: string;
  points: string;
}
interface RaceRow {
  round: string;
  race: string;
  date: string;
  winner: string;
}
interface ResultadosRow {
  raceName: string;
  position: string;
  grid: string;
  driver: string;
  constructor: string;
  fastestLapTime: string;
  points: string;
}

@Component({
  selector: 'app-last-temps',
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
    MatTableModule,
  ],
  templateUrl: './last-temps.component.html',
  styleUrls: ['./last-temps.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastTempsComponent {
  private f1Api = inject(F1ApiService);

  currentView = signal<'drivers' | 'teams' | 'races' | null>(null);
  temporadaControl = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1950),
    Validators.max(2024),
  ]);

  pilotos = signal<DriverRow[]>([]);
  equipos = signal<TeamRow[]>([]);
  carreras = signal<RaceRow[]>([]);
  resultado = signal<ResultadosRow[]>([]);

  displayedColumnsDrivers = ['position', 'piloto', 'constructor', 'points'];
  displayedColumnsTeams = ['position', 'constructor', 'points'];
  displayedColumnsRaces = ['round', 'race', 'date', 'winner'];

  /** Baja el z-index de #progress-container mientras el diálogo de resultados está abierto,
   *  para que su overlay no quede tapado por la barra de progreso (z-index: 1050). */
  dialogOpen = signal(false);

  mostrarPilotos() {
    if (this.temporadaControl.invalid) return;
    const s = this.temporadaControl.value!;
    this.currentView.set('drivers');
    this.f1Api.getDriverStandings(s).subscribe((list) => {
      this.pilotos.set(
        list.map((d) => ({
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
    this.f1Api.getConstructorStandings(s).subscribe((list) => {
      this.equipos.set(
        list.map((d) => ({
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
    this.f1Api.getSeasonWinners(s).subscribe((list) => {
      this.carreras.set(
        list.map((d) => ({
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
    this.dialogOpen.set(true);

    const season = this.temporadaControl.value!;
    this.f1Api.getRaceResults(season, round!).subscribe((results) => {
      const raceData = [
        {
          raceName: race ?? '—',
          results: results.map((result) => ({
            position: result.position ?? '—',
            driver: `${result.Driver.givenName ?? '—'} ${result.Driver.familyName ?? '—'}`,
            constructor: result.Constructor.name ?? '—',
            fastestLapTime: result.FastestLap?.Time?.time ?? '—',
            points: result.points ?? '—',
          })),
        },
      ];

      const dialogRef = this.dialog.open(DialogSeasonResultsComponent, {
        maxWidth: '75vw',
        data: {
          season,
          round,
          race,
          raceData,
        },
      });

      dialogRef.afterClosed().subscribe(() => {
        this.dialogOpen.set(false);
      });
    });
  }
}
