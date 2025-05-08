import { Component, ChangeDetectionStrategy, signal  } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';


type DriverRow = { position: string; piloto: string; constructor: string; points: string; };
type TeamRow   = { position: string; constructor: string; points: string; };

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
    MatTableModule  
  ],
  templateUrl: './last-temps.component.html',
  styleUrls: ['./last-temps.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LastTempsComponent {
currentView = signal<'drivers'|'teams'|null>(null);
  temporadaControl = new FormControl<number|null>(null, [
    Validators.min(1950), Validators.max(2025)
  ]);

  pilotos = signal<DriverRow[]>([]);
  equipos = signal<TeamRow[]>([]);

  displayedColumnsDrivers = ['position','piloto','constructor','points'];
  displayedColumnsTeams   = ['position','constructor','points'];

  constructor(private http: HttpClient) {}

  mostrarPilotos() {
    if (this.temporadaControl.invalid) return;
    const s = this.temporadaControl.value!;
    this.currentView.set('drivers');
    this.http
      .get<any>(`https://api.jolpi.ca/ergast/f1/${s}/driverstandings.json`)
      .subscribe(data => {
        const list = data.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings || [];
        this.pilotos.set(list.map((d: any) => ({
          position:    d.position,
          piloto:      `${d.Driver.givenName} ${d.Driver.familyName}`,
          constructor: d.Constructors[0]?.name ?? '—',
          points:      d.points
        })));
      });
  }

  mostrarEquipos() {
    if (this.temporadaControl.invalid) return;
    const s = this.temporadaControl.value!;
    this.currentView.set('teams');
    this.http
      .get<any>(`https://api.jolpi.ca/ergast/f1/${s}/constructorstandings.json`)
      .subscribe(data => {
        const list = data.MRData.StandingsTable.StandingsLists?.[0]?.ConstructorStandings || [];
        this.equipos.set(list.map((d: any) => ({
          position:    d.position,
          constructor: d.Constructor.name ?? '—',
          points:      d.points
        })));
      });
  }
}