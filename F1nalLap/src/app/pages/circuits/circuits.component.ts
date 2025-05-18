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
}
