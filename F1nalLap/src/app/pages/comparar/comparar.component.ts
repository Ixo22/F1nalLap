import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, forkJoin } from 'rxjs';
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
import { Color, LegendPosition, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { F1ApiService } from '../../services/f1-api.service';

interface DriverRow {
  piloto: string;
  wins: string;
  points: string;
}
interface TeamRow {
  position: string;
  constructor: string;
  wins: string;
  points: string;
}
interface PuntosPorCarreraSerie {
  name: string;
  series: { name: string; value: number }[];
}

const colorSchemeP: Color = {
  name: 'pilotos',
  selectable: true,
  group: ScaleType.Ordinal,
  domain: ['#2a6425', '#f09c1e'],
};

const colorSchemeT: Color = {
  name: 'equipos',
  selectable: true,
  group: ScaleType.Ordinal,
  domain: ['#a01d1d', '#0672ca'],
};

@Component({
  selector: 'app-comparar',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    RouterModule,
    MatMenuModule,
    CloseOtherMenusDirective,
    MatButtonModule,
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSelectModule,
    NgxChartsModule,
  ],
  templateUrl: './comparar.component.html',
  styleUrl: './comparar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompararComponent implements OnInit {
  private f1Api = inject(F1ApiService);
  private destroyRef = inject(DestroyRef);

  temporadaControl = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1950),
    Validators.max(2025),
  ]);

  pilotos = signal<DriverRow[]>([]);
  equipos = signal<TeamRow[]>([]);

  pilotoControl = new FormControl('');
  pilotoSeleccionado = signal<DriverRow | null>(null);
  pilotosFiltrados$: Observable<DriverRow[]> = this.filtrarControl(
    this.pilotoControl,
    this.pilotos,
    'piloto',
    this.pilotoSeleccionado
  );

  equipoControl = new FormControl('');
  equipoSeleccionado = signal<TeamRow | null>(null);
  equiposFiltrados$: Observable<TeamRow[]> = this.filtrarControl(
    this.equipoControl,
    this.equipos,
    'constructor',
    this.equipoSeleccionado
  );

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

  pilotosFiltrados1$: Observable<DriverRow[]> = this.filtrarControl(
    this.piloto1Control,
    this.pilotos,
    'piloto'
  );
  pilotosFiltrados2$: Observable<DriverRow[]> = this.filtrarControl(
    this.piloto2Control,
    this.pilotos,
    'piloto'
  );
  equiposFiltrados1$: Observable<TeamRow[]> = this.filtrarControl(
    this.equipo1Control,
    this.equipos,
    'constructor'
  );
  equiposFiltrados2$: Observable<TeamRow[]> = this.filtrarControl(
    this.equipo2Control,
    this.equipos,
    'constructor'
  );

  colorSchemeP: Color = colorSchemeP;
  colorSchemeT: Color = colorSchemeT;

  LegendPosition = LegendPosition;

  private filtrarControl<T>(
    control: FormControl,
    dataSignal: () => T[],
    campo: keyof T,
    seleccionSignal?: (v: T | null) => void
  ): Observable<T[]> {
    return control.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const filterValue = (value || '').toLowerCase();
        const lista = dataSignal();
        const filtrados = lista.filter((e) =>
          (e[campo] as string).toLowerCase().includes(filterValue)
        );
        if (seleccionSignal) {
          const match = lista.find((e) => (e[campo] as string).toLowerCase() === filterValue);
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

    this.f1Api.getDriverStandings(s).subscribe((list) => {
      this.pilotos.set(
        list.map((d) => ({
          piloto: `${d.Driver.givenName} ${d.Driver.familyName}`,
          wins: d.wins,
          points: d.points,
        }))
      );
    });

    this.f1Api.getConstructorStandings(s).subscribe((list) => {
      this.equipos.set(
        list.map((d) => ({
          position: d.position,
          constructor: d.Constructor.name ?? '—',
          points: d.points,
          wins: d.wins,
        }))
      );
    });
  }

  clearPiloto() {
    this.pilotoControl.setValue('');
    this.pilotoSeleccionado.set(null);
  }
  clearEquipo() {
    this.equipoControl.setValue('');
    this.equipoSeleccionado.set(null);
  }

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

  compararPilotos() {
    this.cargarDatosTemporada();
    this.activarComparar('pilotos');
  }
  compararEquipos() {
    this.cargarDatosTemporada();
    this.activarComparar('equipos');
  }

  ngOnInit() {
    this.piloto1Control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nombre) => {
        this.pilotoComparar1 = this.pilotos().find((p) => p.piloto === nombre) ?? null;
        if (this.pilotoComparar1 && this.pilotoComparar2) this.obtenerPuntosPorCarreraPilotos();
      });
    this.piloto2Control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nombre) => {
        this.pilotoComparar2 = this.pilotos().find((p) => p.piloto === nombre) ?? null;
        if (this.pilotoComparar1 && this.pilotoComparar2) this.obtenerPuntosPorCarreraPilotos();
      });
    this.equipo1Control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nombre) => {
        this.equipoComparar1 = this.equipos().find((e) => e.constructor === nombre) ?? null;
        if (this.equipoComparar1 && this.equipoComparar2) this.obtenerPuntosPorCarreraEquipos();
      });
    this.equipo2Control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nombre) => {
        this.equipoComparar2 = this.equipos().find((e) => e.constructor === nombre) ?? null;
        if (this.equipoComparar1 && this.equipoComparar2) this.obtenerPuntosPorCarreraEquipos();
      });

    if (this.temporadaControl.value) this.cargarDatosTemporada();
    this.temporadaControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.temporadaControl.valid) this.cargarDatosTemporada();
    });
  }

  get pilotosVictoriasChart() {
    return [this.pilotoComparar1, this.pilotoComparar2]
      .filter(Boolean)
      .map((p) => ({ name: p!.piloto, value: +p!.wins }));
  }
  get pilotosPuntosChart() {
    return [this.pilotoComparar1, this.pilotoComparar2]
      .filter(Boolean)
      .map((p) => ({ name: p!.piloto, value: +p!.points }));
  }
  get equiposVictoriasChart() {
    return [this.equipoComparar1, this.equipoComparar2]
      .filter(Boolean)
      .map((e) => ({ name: e!.constructor, value: +e!.wins }));
  }
  get equiposPuntosChart() {
    return [this.equipoComparar1, this.equipoComparar2]
      .filter(Boolean)
      .map((e) => ({ name: e!.constructor, value: +e!.points }));
  }

  puntosPorCarrera: PuntosPorCarreraSerie[] = [];
  carrerasLabels: string[] = [];
  cargandoPuntos = false;

  obtenerPuntosPorCarreraPilotos() {
    if (!this.temporadaControl.value || !this.pilotoComparar1 || !this.pilotoComparar2) return;
    const piloto1 = this.pilotoComparar1;
    const piloto2 = this.pilotoComparar2;

    this.cargandoPuntos = true;
    this.puntosPorCarrera = [];
    this.carrerasLabels = [];

    const season = this.temporadaControl.value;
    this.f1Api.getSeasonSchedule(season).subscribe((carreras) => {
      this.carrerasLabels = carreras.map((c) =>
        (c.raceName ?? '—').replace(/ Grand Prix/i, '').trim()
      );

      forkJoin(carreras.map((c) => this.f1Api.getRaceResults(season, c.round))).subscribe(
        (resultadosPorCarrera) => {
          const puntos1 = resultadosPorCarrera.map((results) => {
            const resultado = results.find(
              (r) => `${r.Driver.givenName} ${r.Driver.familyName}` === piloto1.piloto
            );
            return resultado ? +resultado.points! : 0;
          });
          const puntos2 = resultadosPorCarrera.map((results) => {
            const resultado = results.find(
              (r) => `${r.Driver.givenName} ${r.Driver.familyName}` === piloto2.piloto
            );
            return resultado ? +resultado.points! : 0;
          });

          this.puntosPorCarrera = [
            {
              name: piloto1.piloto,
              series: this.carrerasLabels.map((label, i) => ({ name: label, value: puntos1[i] })),
            },
            {
              name: piloto2.piloto,
              series: this.carrerasLabels.map((label, i) => ({ name: label, value: puntos2[i] })),
            },
          ];
          this.cargandoPuntos = false;
        }
      );
    });
  }

  obtenerPuntosPorCarreraEquipos() {
    if (!this.temporadaControl.value || !this.equipoComparar1 || !this.equipoComparar2) return;
    const equipo1 = this.equipoComparar1;
    const equipo2 = this.equipoComparar2;

    this.cargandoPuntos = true;
    this.puntosPorCarrera = [];
    this.carrerasLabels = [];

    const season = this.temporadaControl.value;
    this.f1Api.getSeasonSchedule(season).subscribe((carreras) => {
      this.carrerasLabels = carreras.map((c) =>
        (c.raceName ?? '—').replace(/ Grand Prix/i, '').trim()
      );

      forkJoin(carreras.map((c) => this.f1Api.getRaceResults(season, c.round))).subscribe(
        (resultadosPorCarrera) => {
          const puntos1 = resultadosPorCarrera.map((results) =>
            results
              .filter((r) => r.Constructor.name === equipo1.constructor)
              .reduce((acc, curr) => acc + +(curr.points ?? 0), 0)
          );
          const puntos2 = resultadosPorCarrera.map((results) =>
            results
              .filter((r) => r.Constructor.name === equipo2.constructor)
              .reduce((acc, curr) => acc + +(curr.points ?? 0), 0)
          );

          this.puntosPorCarrera = [
            {
              name: equipo1.constructor,
              series: this.carrerasLabels.map((label, i) => ({ name: label, value: puntos1[i] })),
            },
            {
              name: equipo2.constructor,
              series: this.carrerasLabels.map((label, i) => ({ name: label, value: puntos2[i] })),
            },
          ];
          this.cargandoPuntos = false;
        }
      );
    });
  }

  get chartView(): [number, number] {
    const width = window.innerWidth;
    if (width < 500) return [250, 200];
    if (width < 800) return [400, 250];
    if (width < 1000) return [500, 300];
    return [600, 300];
  }

  get pointView(): [number, number] {
    const width = window.innerWidth;
    if (width < 400) return [250, 250];
    if (width < 500) return [320, 250];
    if (width < 800) return [400, 250];
    if (width < 1000) return [600, 300];
    if (width < 1200) return [800, 300];
    return [1000, 400];
  }
}
