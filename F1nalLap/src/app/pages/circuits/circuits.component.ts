import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EstrategiasService } from '../../services/strategies.service';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';
import circuitosJson from '../../../assets/json/circuitos2025.json';
import { CircuitInfo } from '../../models/circuit.models';
import {
  Compuesto,
  EstrategiaResultado,
  MejorEstrategiaResultado,
  StintResultado,
  esEstrategiaValida,
} from '../../models/estrategia.models';

interface DegradacionPunto {
  vuelta: number;
  value: number;
  fase: string;
}

interface DegradacionChartSerie {
  name: string;
  series: { name: string; value: number; extra: { fase: string } }[];
}

@Component({
  selector: 'app-circuits',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatMenuTrigger,
    MatButtonModule,
    CloseOtherMenusDirective,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    NgxChartsModule,
  ],
  templateUrl: './circuits.component.html',
  styleUrl: './circuits.component.scss',
})
export class CircuitsComponent implements OnInit {
  private strategiesService = inject<EstrategiasService>(EstrategiasService);
  private snackBar = inject(MatSnackBar);

  circuits: CircuitInfo[] = [];
  filteredCircuits: CircuitInfo[] = [];
  circuitControl = new FormControl<CircuitInfo | string | null>('');
  selectedCircuit: CircuitInfo | null = null;
  bestStrategies: EstrategiaResultado[] = [];
  bestStrategiesVisible = false;
  simuladorActivo = false;
  simuladorResultado: EstrategiaResultado | null = null;
  simuladorStints: { compuesto: string; vueltas: number | null }[] = [];
  simuladorParadas = 1;
  compuestos: string[] = ['Blandos', 'Medios', 'Duros'];

  degradacionChartData: unknown[] = [];
  degradacionChartView: [number, number] = [700, 300];
  degradacionChartColorScheme = {
    domain: ['#1976d2', '#d32f2f'],
  };

  LegendPosition = LegendPosition;

  ngOnInit(): void {
    this.circuits = circuitosJson;
    this.filteredCircuits = circuitosJson;

    this.circuitControl.valueChanges.subscribe((value) => {
      this.filteredCircuits = this._filterCircuits(typeof value === 'string' ? value : '');
      if (!value) {
        this.selectedCircuit = null;
      }
    });
  }

  private _filterCircuits(value: string): CircuitInfo[] {
    const filterValue = value.toLowerCase();
    return this.circuits.filter((circuit) => circuit.name_GP.toLowerCase().includes(filterValue));
  }

  onCircuitSelected(circuito: CircuitInfo) {
    this.selectedCircuit = circuito;
    this.circuitControl.setValue(circuito);
  }

  displayCircuitName(circuit: CircuitInfo | string | null): string {
    if (!circuit) return '';
    return typeof circuit === 'string' ? circuit : circuit.name_GP;
  }

  clearSelection() {
    this.circuitControl.setValue('');
    this.selectedCircuit = null;
  }

  showBestStrategies(circuit: CircuitInfo) {
    this.bestStrategiesVisible = true;
    this.simuladorActivo = false;
    this.strategiesService.getBestStrategies(circuit).subscribe((strategies) => {
      this.setBestStrategies(strategies);
    });
  }

  getPitStops(stints: StintResultado[]): { compuesto: string; vuelta: number }[] {
    const stops = [];
    let currentLap = 0;
    for (let i = 1; i < stints.length; i++) {
      currentLap += stints[i - 1].vueltas;
      stops.push({
        compuesto: stints[i].compuesto,
        vuelta: currentLap,
      });
    }
    return stops;
  }

  onSimulador(circuito: CircuitInfo) {
    this.selectedCircuit = circuito;
    this.simuladorActivo = true;
    this.bestStrategiesVisible = false;
    this.simuladorResultado = null;
    this.simuladorStints = [];
    this.simuladorParadas = 1;
  }

  agregarStint() {
    this.simuladorStints.push({ compuesto: '', vueltas: null });
  }

  eliminarStint(i: number) {
    this.simuladorStints.splice(i, 1);
    if (this.simuladorStints.length === 0) {
      this.simuladorResultado = null;
    }
  }

  simularEstrategiaLibre() {
    if (!this.selectedCircuit) return;
    if (!this.bestStrategies || this.bestStrategies.length === 0) {
      this.calcularMejoresEstrategias(this.selectedCircuit);
    }
    const totalVueltas = this.simuladorStints.reduce((acc, s) => acc + Number(s.vueltas), 0);
    const vueltasCircuito = this.selectedCircuit.laps;

    if (totalVueltas > vueltasCircuito) {
      this.snackBar.open(
        `La suma de vueltas (${totalVueltas}) no puede superar las vueltas del circuito (${vueltasCircuito}).`,
        'Cerrar',
        { duration: 5000 }
      );
      return;
    }
    if (totalVueltas < vueltasCircuito) {
      this.snackBar.open(
        `La suma de vueltas (${totalVueltas}) no puede ser menor que las vueltas del circuito (${vueltasCircuito}).`,
        'Cerrar',
        { duration: 5000 }
      );
      return;
    }

    const estrategia: [Compuesto, number][] = this.simuladorStints
      .filter((s): s is { compuesto: string; vueltas: number } => Boolean(s.compuesto && s.vueltas))
      .map((s) => [s.compuesto.toLowerCase() as Compuesto, Number(s.vueltas)]);

    this.strategiesService
      .simularEstrategiaLibre(this.selectedCircuit, estrategia)
      .subscribe((res) => {
        this.simuladorResultado = res;
        this.actualizarGraficaDegradacion();
      });
  }

  calcularMejoresEstrategias(circuit: CircuitInfo): void {
    this.strategiesService.getBestStrategies(circuit).subscribe((strategies) => {
      this.setBestStrategies(strategies);
      this.actualizarGraficaDegradacion();
    });
  }

  private setBestStrategies(strategies: MejorEstrategiaResultado[]): void {
    const validas = strategies.filter(esEstrategiaValida);
    if (validas.length === 0 && strategies.length > 0) {
      this.snackBar.open('No se encontraron estrategias válidas para este circuito.', 'Cerrar', {
        duration: 5000,
      });
    }
    this.bestStrategies = validas;
  }

  degradacionSimuladaChartData: DegradacionChartSerie[] = [];
  degradacionCalculadaChartData: DegradacionChartSerie[] = [];
  tiemposPorVueltaSimulada: { vuelta: number; tiempo: number }[] = [];
  tiemposPorVueltaCalculada: { vuelta: number; tiempo: number }[] = [];
  diferenciaTiemposChartData: DegradacionChartSerie[] = [];

  actualizarGraficaDegradacion() {
    const stintsSim = this.simuladorResultado?.stints ?? [];
    const stintsCalc = this.bestStrategies[0]?.stints ?? [];

    this.degradacionSimuladaChartData = [];
    this.degradacionCalculadaChartData = [];
    this.tiemposPorVueltaSimulada = [];
    this.tiemposPorVueltaCalculada = [];

    let vueltaGlobal = 1;

    stintsSim.forEach((stint, idx) => {
      const degradaciones = this.calcularDegradacionStintPorFase(
        stint.compuesto,
        stint.vueltas,
        this.strategiesService
      );
      this.degradacionSimuladaChartData.push({
        name: `${stint.compuesto} (${idx + 1})`,
        series: degradaciones.map((d) => ({
          name: (vueltaGlobal++).toString(),
          value: d.value,
          extra: { fase: d.fase },
        })),
      });
    });

    vueltaGlobal = 1;
    stintsCalc.forEach((stint, idx) => {
      const degradaciones = this.calcularDegradacionStintPorFase(
        stint.compuesto,
        stint.vueltas,
        this.strategiesService
      );
      this.degradacionCalculadaChartData.push({
        name: `${stint.compuesto} (${idx + 1})`,
        series: degradaciones.map((d) => ({
          name: (vueltaGlobal++).toString(),
          value: d.value,
          extra: { fase: d.fase },
        })),
      });
    });

    const diferenciaTiempos = this.tiemposPorVueltaSimulada.map((simulada, index) => {
      const calculada = this.tiemposPorVueltaCalculada[index];
      return {
        vuelta: index + 1,
        diferencia: calculada ? simulada.tiempo - calculada.tiempo : 0,
      };
    });

    this.diferenciaTiemposChartData = [
      {
        name: 'Diferencia de Tiempos (simulada vs calculada)',
        series: diferenciaTiempos.map((d) => ({
          name: d.vuelta.toString(),
          value: d.diferencia,
          extra: { fase: '' },
        })),
      },
    ];
  }

  private calcularDegradacionStintPorFase(
    compuesto: Compuesto,
    vueltas: number,
    service: EstrategiasService
  ): DegradacionPunto[] {
    const vidaUtil = service.getVidaUtil(compuesto);
    const vidaUtilPromedio = Math.floor(vidaUtil / 2);
    const degradaciones: DegradacionPunto[] = [];

    for (let vuelta = 0; vuelta < vueltas; vuelta++) {
      let fase: 'inicial' | 'media' | 'final';

      if (vuelta <= 5) fase = 'inicial';
      else if (vuelta <= vidaUtilPromedio && vuelta > 5) fase = 'media';
      else fase = 'final';

      let degradacion: number;
      if (vuelta >= vidaUtil) {
        const vueltasFueraVidaUtil = vuelta - vidaUtil;
        degradacion = 0.5 + Math.pow(vueltasFueraVidaUtil, 1.5) * 1.5;
      } else {
        degradacion = service.calcularDegradacionPorVuelta(compuesto, vuelta, vueltas);
      }

      degradaciones.push({
        vuelta: vuelta + 1,
        value: degradacion,
        fase: fase,
      });
    }

    return degradaciones;
  }

  get simuladoVsMejorClases(): Record<string, boolean> {
    return this.compararTiempos(
      this.simuladorResultado?.tiempo_total_segundos,
      this.bestStrategies[0]?.tiempo_total_segundos
    );
  }

  get mejorVsSimuladoClases(): Record<string, boolean> {
    return this.compararTiempos(
      this.bestStrategies[0]?.tiempo_total_segundos,
      this.simuladorResultado?.tiempo_total_segundos
    );
  }

  private compararTiempos(a: number | undefined, b: number | undefined): Record<string, boolean> {
    if (a === undefined || b === undefined) return {};
    return {
      'tiempo-mejor': a < b,
      'tiempo-peor': a > b,
      'tiempo-igual': a === b,
    };
  }

  get vueltasLibres(): number {
    const vueltasCircuito = this.selectedCircuit?.laps ?? 0;
    const totalVueltas = this.simuladorStints.reduce((acc, s) => acc + Number(s.vueltas), 0);
    return vueltasCircuito - totalVueltas;
  }
}
