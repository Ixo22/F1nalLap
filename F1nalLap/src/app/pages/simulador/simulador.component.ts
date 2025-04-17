import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-simulador',
  templateUrl: './simulador.component.html',
  styleUrls: ['./simulador.component.scss'],
})
export class SimuladorComponent implements OnInit {
  circuito: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const circuitoNameGP = this.route.snapshot.paramMap.get('name_GP');
    console.log('Nombre del GP:', circuitoNameGP); // Verifica el parámetro

    fetch('./assets/json/circuitos2025.json')
      .then((response) => response.json())
      .then((data) => {
        console.log('Datos del JSON:', data); // Verifica los datos cargados
        this.circuito = data.find((circuito: any) => circuito.name_GP === circuitoNameGP);
        console.log('Circuito encontrado:', this.circuito); // Verifica el circuito encontrado
      })
      .catch((error) => {
        console.error('Error cargando el JSON:', error);
      });
  }
}
