import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

type DriverRow = { piloto: string; wins: string; points: string; };
type TeamRow = { position: string; constructor: string; wins: string; points: string; };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatSlideToggleModule, RouterModule, MatMenuModule, CloseOtherMenusDirective,
    MatButtonModule, CommonModule, MatInputModule, MatIconModule,
    MatAutocompleteModule, MatFormFieldModule, ReactiveFormsModule,
    HttpClientModule, MatTableModule, MatSelectModule
  ],
  templateUrl: './comparar.component.html',
  styleUrl: './comparar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompararComponent {
  temporadaControl = new FormControl<number | null>(null, [
    Validators.required, Validators.min(1950), Validators.max(2025)
  ]);

  pilotos = signal<DriverRow[]>([]);
  equipos = signal<TeamRow[]>([]);

  pilotoControl = new FormControl('');
  pilotoSeleccionado = signal<DriverRow | null>(null);
  pilotosFiltrados$: Observable<DriverRow[]> = this.filtrarControl(this.pilotoControl, this.pilotos, 'piloto', this.pilotoSeleccionado);

  equipoControl = new FormControl('');
  equipoSeleccionado = signal<TeamRow | null>(null);
  equiposFiltrados$: Observable<TeamRow[]> = this.filtrarControl(this.equipoControl, this.equipos, 'constructor', this.equipoSeleccionado);

  displayedColumnsDriver = ['piloto', 'wins', 'points'];
  displayedColumnsTeam = ['position', 'constructor', 'wins', 'points'];

  modoComparar: 'pilotos' | 'equipos' | null = null;
  piloto1Control = new FormControl('');
  piloto2Control = new FormControl('');
  pilotoComparar1: DriverRow | null = null;
  pilotoComparar2: DriverRow | null = null;
  equipo1Control = new FormControl('');
  equipo2Control = new FormControl('');
  equipoComparar1: TeamRow | null = null;
  equipoComparar2: TeamRow | null = null;

  pilotosFiltrados1$: Observable<DriverRow[]> = this.filtrarControl(this.piloto1Control, this.pilotos, 'piloto');
  pilotosFiltrados2$: Observable<DriverRow[]> = this.filtrarControl(this.piloto2Control, this.pilotos, 'piloto');
  equiposFiltrados1$: Observable<TeamRow[]> = this.filtrarControl(this.equipo1Control, this.equipos, 'constructor');
  equiposFiltrados2$: Observable<TeamRow[]> = this.filtrarControl(this.equipo2Control, this.equipos, 'constructor');

  constructor(private http: HttpClient) {}

  private filtrarControl<T>(
    control: FormControl,
    dataSignal: () => T[],
    campo: keyof T,
    seleccionSignal?: (v: T | null) => void
  ): Observable<T[]> {
    return control.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = (value || '').toLowerCase();
        const lista = dataSignal();
        const filtrados = lista.filter(e => (e[campo] as string).toLowerCase().includes(filterValue));
        if (seleccionSignal) {
          const match = lista.find(e => (e[campo] as string).toLowerCase() === filterValue);
          seleccionSignal(match ?? null);
        }
        return filtrados;
      })
    );
  }

  cargarDatosTemporada() {
    if (this.temporadaControl.invalid) return;
    this.modoComparar = null;
    this.piloto1Control.setValue('');
    this.piloto2Control.setValue('');
    this.pilotoComparar1 = null;
    this.pilotoComparar2 = null;
    this.equipo1Control.setValue('');
    this.equipo2Control.setValue('');
    this.equipoComparar1 = null;
    this.equipoComparar2 = null;

    const s = this.temporadaControl.value!;
    this.pilotoSeleccionado.set(null);
    this.equipoSeleccionado.set(null);
    this.pilotoControl.setValue('', { emitEvent: false });
    this.equipoControl.setValue('', { emitEvent: false });

    this.http.get<any>(`https://api.jolpi.ca/ergast/f1/${s}/driverstandings.json`).subscribe(data => {
      const list = data.MRData.StandingsTable.StandingsLists?.[0]?.DriverStandings || [];
      this.pilotos.set(list.map((d: any) => ({
        piloto: `${d.Driver.givenName} ${d.Driver.familyName}`,
        wins: d.wins, points: d.points
      })));
    });

    this.http.get<any>(`https://api.jolpi.ca/ergast/f1/${s}/constructorstandings.json`).subscribe(data => {
      const list = data.MRData.StandingsTable.StandingsLists?.[0]?.ConstructorStandings || [];
      this.equipos.set(list.map((d: any) => ({
        position: d.position,
        constructor: d.Constructor.name ?? '—',
        points: d.points, wins: d.wins
      })));
    });
  }

  clearPiloto() { this.pilotoControl.setValue(''); this.pilotoSeleccionado.set(null); }
  clearEquipo() { this.equipoControl.setValue(''); this.equipoSeleccionado.set(null); }

  activarComparar(tipo: 'pilotos' | 'equipos') {
    this.modoComparar = tipo;
    this.piloto1Control.setValue('');
    this.piloto2Control.setValue('');
    this.pilotoComparar1 = null;
    this.pilotoComparar2 = null;
    this.equipo1Control.setValue('');
    this.equipo2Control.setValue('');
    this.equipoComparar1 = null;
    this.equipoComparar2 = null;
  }

  compararPilotos() { this.cargarDatosTemporada(); this.activarComparar('pilotos'); }
  compararEquipos() { this.cargarDatosTemporada(); this.activarComparar('equipos'); }

  ngOnInit() {
    this.piloto1Control.valueChanges.subscribe(nombre => {
      this.pilotoComparar1 = this.pilotos().find(p => p.piloto === nombre) ?? null;
    });
    this.piloto2Control.valueChanges.subscribe(nombre => {
      this.pilotoComparar2 = this.pilotos().find(p => p.piloto === nombre) ?? null;
    });
    this.equipo1Control.valueChanges.subscribe(nombre => {
      this.equipoComparar1 = this.equipos().find(e => e.constructor === nombre) ?? null;
    });
    this.equipo2Control.valueChanges.subscribe(nombre => {
      this.equipoComparar2 = this.equipos().find(e => e.constructor === nombre) ?? null;
    });

    if (this.temporadaControl.value) this.cargarDatosTemporada();
    this.temporadaControl.valueChanges.subscribe(() => {
      if (this.temporadaControl.valid) this.cargarDatosTemporada();
    });
  }
}
