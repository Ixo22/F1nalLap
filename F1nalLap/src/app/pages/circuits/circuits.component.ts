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
import { EstrategiasService } from '../../../assets/services/strategies.service'; // Ajusta la ruta

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
    MatInputModule
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
  simuladorStints: { compuesto: string, vueltas: number | null }[] = [];
  simuladorParadas = 1;
  compuestos: string[] = ['Blandos', 'Medios', 'Duros'];

  constructor(private http: HttpClient, @Inject(EstrategiasService) private strategiesService: EstrategiasService) {}

  ngOnInit(): void {
    this.http
      .get<any[]>('./../../../assets/json/circuitos2025.json')
      .subscribe((data) => {
        this.circuits = data;
        this.filteredCircuits = data;
      });

    this.circuitControl.valueChanges.subscribe(value => {
      this.filteredCircuits = this._filterCircuits(value || '');
      if (!value) {
        this.selectedCircuit = null;
      }
    });
  }

  private _filterCircuits(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.circuits.filter(circuit =>
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
    this.strategiesService.getBestStrategies(circuit).subscribe((strategies: any[]) => {
      this.bestStrategies = strategies;
    });
  }

  getPitStops(stints: any[]): {compuesto: string, vuelta: number}[] {
    let stops = [];
    let currentLap = 0;
    for (let i = 1; i < stints.length; i++) {
      currentLap += stints[i-1].vueltas;
      stops.push({
        compuesto: stints[i].compuesto,
        vuelta: currentLap
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
    const totalVueltas = this.simuladorStints.reduce((acc, s) => acc + Number(s.vueltas), 0);
    const vueltasCircuito = this.selectedCircuit.laps ?? this.selectedCircuit.vueltas;

    if (totalVueltas > vueltasCircuito) {
      alert(`La suma de vueltas (${totalVueltas}) no puede superar las vueltas del circuito (${vueltasCircuito}).`);
      return;
    }
    if (totalVueltas < vueltasCircuito) {
      alert(`La suma de vueltas (${totalVueltas}) no puede ser menor que las vueltas del circuito (${vueltasCircuito}).`);
      return;
    }

    const estrategia = this.simuladorStints
      .filter(s => s.compuesto && s.vueltas)
      .map(s => [s.compuesto.toLowerCase() as "blandos" | "medios" | "duros", Number(s.vueltas)] as ["blandos" | "medios" | "duros", number]);
    this.strategiesService.simularEstrategiaLibre(this.selectedCircuit, estrategia)
      .subscribe(res => this.simuladorResultado = res);
  }

  get vueltasLibres(): number {
    const vueltasCircuito = this.selectedCircuit?.laps ?? this.selectedCircuit?.vueltas ?? 0;
    const totalVueltas = this.simuladorStints.reduce((acc, s) => acc + Number(s.vueltas), 0);
    return vueltasCircuito - totalVueltas;
  }
}
