import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // 👈 ¡esto es lo que faltaba!

@Component({
  selector: 'app-simulador',
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './simulador.component.html',
  styleUrls: ['./simulador.component.scss'],
})
export class SimuladorComponent implements OnInit {
  circuito: any;
  private activatedRoute = inject(ActivatedRoute);
  //public num: string = '1';
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {

    /*this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this.num = params['id'];
      }
      console.log('Id del circuit:', this.num); // Aquí puedes ver que el array tiene los datos correctos
    });*/


    const idcircuito = this.route.snapshot.paramMap.get('id');
    console.log('Id del GPpppppp:', idcircuito); // Verifica el parámetro

    fetch('./../../../assets/json/circuitos2025.json')
      .then((response) => response.json())
      .then((data) => {
        //console.log('Datos del JSON:', data); // Verifica los datos cargados
        this.circuito = data.find((circuito: any) => circuito.id == idcircuito);
        console.log('Circuito encontrado:', this.circuito);
        console.log('Id del circuitoooooo: ', this.circuito.id) // Verifica el circuito encontrado
      })
      .catch((error) => {
        console.error('Error cargando el JSON:', error);
      });
  }
}
