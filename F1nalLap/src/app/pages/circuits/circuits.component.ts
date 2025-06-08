import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EstrategiasService } from '../../../assets/services/strategies.service';
import { LegendPosition, NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-circuits',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
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
    NgxChartsModule,
  ],
  providers: [EstrategiasService],
  templateUrl: './circuits.component.html',
  styleUrl: './circuits.component.scss',
})
export class CircuitsComponent implements OnInit {
  circuits: any[] = [];
  filteredCircuits: any[] = [];
  circuitControl = new FormControl('');
  selectedCircuit: any = null;
  bestStrategies: any[] = [];
  bestStrategiesVisible = false;
  simuladorActivo = false;
  simuladorResultado: any = null;
  simuladorStints: { compuesto: string; vueltas: number | null }[] = [];
  simuladorParadas = 1;
  compuestos: string[] = ['Blandos', 'Medios', 'Duros'];

  degradacionChartData: any[] = [];
  degradacionChartView: [number, number] = [700, 300];
  degradacionChartColorScheme = {
    domain: ['#1976d2', '#d32f2f'],
  };

  LegendPosition = LegendPosition;

  constructor(
    private http: HttpClient,
    @Inject(EstrategiasService) private strategiesService: EstrategiasService
  ) {}

  ngOnInit(): void {
    this.http
      .get<any[]>('./../../../assets/json/circuitos2025.json')
      .subscribe((data) => {
        this.circuits = data;
        this.filteredCircuits = data;
      });

    this.circuitControl.valueChanges.subscribe((value) => {
      this.filteredCircuits = this._filterCircuits(value || '');
      if (!value) {
        this.selectedCircuit = null;
      }
    });
  }

  private _filterCircuits(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.circuits.filter((circuit) =>
      circuit.name_GP.toLowerCase().includes(filterValue)
    );
  }

  onCircuitSelected(circuito: any) {
    this.selectedCircuit = circuito;
    this.circuitControl.setValue(circuito); // <-- Añade esta línea
  }

  displayCircuitName(circuit: any): string {
    return circuit ? circuit.name_GP : '';
  }

  clearSelection() {
    this.circuitControl.setValue('');
    this.selectedCircuit = null;
  }

  showBestStrategies(circuit: any) {
    this.bestStrategiesVisible = true;
    this.simuladorActivo = false;
    this.strategiesService
      .getBestStrategies(circuit)
      .subscribe((strategies: any[]) => {
        this.bestStrategies = strategies;
      });
  }

  getPitStops(stints: any[]): { compuesto: string; vuelta: number }[] {
    let stops = [];
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

  onSimulador(circuito: any) {
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
    if (!this.bestStrategies || this.bestStrategies.length === 0) {
      this.calcularMejoresEstrategias(this.selectedCircuit);
    }
    const totalVueltas = this.simuladorStints.reduce(
      (acc, s) => acc + Number(s.vueltas),
      0
    );
    const vueltasCircuito =
      this.selectedCircuit.laps ?? this.selectedCircuit.vueltas;

    if (totalVueltas > vueltasCircuito) {
      alert(
        `La suma de vueltas (${totalVueltas}) no puede superar las vueltas del circuito (${vueltasCircuito}).`
      );
      return;
    }
    if (totalVueltas < vueltasCircuito) {
      alert(
        `La suma de vueltas (${totalVueltas}) no puede ser menor que las vueltas del circuito (${vueltasCircuito}).`
      );
      return;
    }

    const estrategia = this.simuladorStints
      .filter((s) => s.compuesto && s.vueltas)
      .map(
        (s) =>
          [
            s.compuesto.toLowerCase() as 'blandos' | 'medios' | 'duros',
            Number(s.vueltas),
          ] as ['blandos' | 'medios' | 'duros', number]
      );
    this.strategiesService
      .simularEstrategiaLibre(this.selectedCircuit, estrategia)
      .subscribe((res) => {
        this.simuladorResultado = res;
        this.actualizarGraficaDegradacion();
        console.log('Simulado resultado:', this.simuladorResultado);
        if (this.bestStrategies[0]) {
          console.log('Best completa:', this.bestStrategies[0]);
        }
      });
  }

  calcularMejoresEstrategias(circuit: any): void {
    this.strategiesService
      .getBestStrategies(circuit)
      .subscribe((strategies: any[]) => {
        this.bestStrategies = strategies;
        this.actualizarGraficaDegradacion();
        if (this.bestStrategies[0]) {
          console.log('Best completa:', this.bestStrategies[0]);
        }
      });
  }

  degradacionSimuladaChartData: any[] = [];
  degradacionCalculadaChartData: any[] = [];
  tiemposPorVueltaSimulada: any[] = [];
  tiemposPorVueltaCalculada: any[] = [];
  diferenciaTiemposChartData: any[] = [];


  actualizarGraficaDegradacion() {
    const stintsSim = this.simuladorResultado?.stints || [];
    const stintsCalc = this.bestStrategies[0]?.stints || [];

    this.degradacionSimuladaChartData = [];
    this.degradacionCalculadaChartData = [];
    this.tiemposPorVueltaSimulada = [];
    this.tiemposPorVueltaCalculada = [];

    let vueltaGlobal = 1;

    stintsSim.forEach((stint: any, idx: number) => {
      const comp = stint.compuesto.toLowerCase() as
        | 'blandos'
        | 'medios'
        | 'duros';
      const degradaciones = this.calcularDegradacionStintPorFase(
        comp,
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
    stintsCalc.forEach((stint: any, idx: number) => {
      const comp = stint.compuesto.toLowerCase() as
        | 'blandos'
        | 'medios'
        | 'duros';
      const degradaciones = this.calcularDegradacionStintPorFase(
        comp,
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

    const diferenciaTiempos = this.tiemposPorVueltaSimulada.map(
      (simulada, index) => {
        const calculada = this.tiemposPorVueltaCalculada[index];
        return {
          vuelta: index + 1,
          diferencia: calculada ? simulada.tiempo - calculada.tiempo : 0,
        };
      }
    );

    this.diferenciaTiemposChartData = [
      {
        name: 'Diferencia de Tiempos (simulada vs calculada)',
        series: diferenciaTiempos.map((d) => ({
          name: d.vuelta.toString(),
          value: d.diferencia,
        })),
      },
    ];
  }

  generarDegradacionSeries(stints: any[], vueltasTotales: number): any[] {
    let series: any[] = [];
    let vueltaActual = 0;
    for (const stint of stints) {
      const inicio = vueltaActual;
      const fin = vueltaActual + stint.vueltas;
      let degradacionPorVuelta =
        stint.compuesto?.toLowerCase() === 'blandos'
          ? 0.15
          : stint.compuesto?.toLowerCase() === 'medios'
          ? 0.1
          : 0.07;
      for (let v = inicio; v < fin; v++) {
        let valor = +(degradacionPorVuelta * (v - inicio + 1)).toFixed(3);
        series.push({ name: (v + 1).toString(), value: valor });
      }
      vueltaActual = fin;
    }
    return series;
  }

  private calcularDegradacionStintPorFase(
    compuesto: 'blandos' | 'medios' | 'duros',
    vueltas: number,
    service: EstrategiasService
  ): { vuelta: number; value: number; fase: string }[] {
    const fases: string[] = [];
    const vidaUtil = (service as any).vidaUtil[compuesto];
    const vidaUtilPromedio = Math.floor(vidaUtil / 2);
    const degradaciones: { vuelta: number; value: number; fase: string }[] = [];

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
        degradacion = (service as any).calcularDegradacion.call(
          service,
          compuesto,
          vuelta,
          vueltas
        );
      }

      degradaciones.push({
        vuelta: vuelta + 1,
        value: degradacion,
        fase: fase,
      });
    }

    return degradaciones;
  }

  get vueltasLibres(): number {
    const vueltasCircuito =
      this.selectedCircuit?.laps ?? this.selectedCircuit?.vueltas ?? 0;
    const totalVueltas = this.simuladorStints.reduce(
      (acc, s) => acc + Number(s.vueltas),
      0
    );
    return vueltasCircuito - totalVueltas;
  }
}
