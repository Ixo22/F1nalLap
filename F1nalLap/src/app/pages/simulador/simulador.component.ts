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
        this.circuito = data.find((circuito: any) => circuito.name_GP == idcircuito); // Para mostrar el nombre del GP en la ruta "simulador/Japan%20Grand%20Prix"
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
