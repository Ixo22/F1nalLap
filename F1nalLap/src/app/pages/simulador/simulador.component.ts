import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import {
  generarEstrategias,
  simularEstrategia,
  convertirTiempo,
  formatearEstrategia,
  Compuesto
} from '../../utils/estrategia';



@Component({
  selector: 'app-simulador',
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './simulador.component.html',
  styleUrls: ['./simulador.component.scss'],
})
export class SimuladorComponent implements OnInit {
  circuito: any;











  estrategias: string[] = [];

  calcularEstrategias(): void {
    if (!this.circuito) return;
  
    const vueltasTotales = this.circuito.laps;
    const circuitoInfo = {
      tiempo_inicial: this.circuito.tiempo_inicial
    };
  
    const candidatas = generarEstrategias(vueltasTotales);
    const mejores: string[] = [];
  
    for (const estrategia of candidatas) {
      try {
        const [tiempo, estrategiaAjustada] = simularEstrategia(circuitoInfo, vueltasTotales, estrategia);
        
        if (isFinite(tiempo)) {
          const tiempoFinal = convertirTiempo(tiempo * 1000);
          console.log('Tiempo: ', tiempoFinal);
          mejores.push(`${formatearEstrategia(estrategiaAjustada)} (${tiempoFinal})`);
        }
        
        if (mejores.length === 3) break;
      } catch (error) {
        console.warn('Estrategia descartada:', error);
      }
    }
  
    this.estrategias = mejores;
    console.log('Estrategias calculadas:', this.estrategias);
  }
  






  private activatedRoute = inject(ActivatedRoute);
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    //const idcircuito = this.route.snapshot.paramMap.get('id'); // Para mostrar el id en la ruta "simulador/3"
    const idcircuito = this.route.snapshot.paramMap.get('name_GP'); // Para mostrar el nombre del GP en la ruta "simulador/Japan%20Grand%20Prix"
    console.log('Id del GP:', idcircuito); // Verifica el parámetro

    fetch('./../../../assets/json/circuitos2025.json')
      .then((response) => response.json())
      .then((data) => {
        //console.log('Datos del JSON:', data); // Verifica los datos cargados del JSON
        //this.circuito = data.find((circuito: any) => circuito.id == idcircuito); // Para mostrar el id en la ruta "simulador/3"
        this.circuito = data.find(
          (circuito: any) => circuito.name_GP == idcircuito
        ); // Para mostrar el nombre del GP en la ruta "simulador/Japan%20Grand%20Prix"


        if (this.circuito?.lap_record) {
          const lapRecord = this.circuito.lap_record; // e.g. "1:32.238"
          const [minutos, segundos] = lapRecord.split(':');
          const tiempoInicial = parseInt(minutos) * 60 + parseFloat(segundos);
          this.circuito.tiempo_inicial = tiempoInicial;
          console.log('Tiempo inicial estimado:', tiempoInicial);
        }
        else {
          this.circuito.tiempo_inicial = 78.345; // Valor por defecto si no hay lap_record
          console.log('No se encontró lap_record, usando 78.345 como tiempo inicial.');
        }        
        console.log('Circuito encontrado:', this.circuito); // Verifica el circuito encontrado
        console.log('Id del circuito: ', this.circuito.id); // Verifica el id del circuito
        console.log('Nombre del circuito: ', this.circuito.name); // Verifica el nombre del circuito
        console.log('Nombre del GP: ', this.circuito.name_GP); // Verifica el nombre del GP


      })
      .catch((error) => {
        console.error('Error cargando el JSON:', error);
      });


      
  }
}
