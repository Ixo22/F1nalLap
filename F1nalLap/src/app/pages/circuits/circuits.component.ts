import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // 👈 ¡esto es lo que faltaba!

import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CloseOtherMenusDirective } from '../../Cerrado/cerrado.component';

@Component({
  selector: 'app-circuits',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule, 
    RouterModule,
    MatMenuModule,
    MatMenuTrigger,
    MatButtonModule,], 
  templateUrl: './circuits.component.html',
  styleUrl: './circuits.component.scss',
})
export class CircuitsComponent
  extends CloseOtherMenusDirective
  implements OnInit
{
  circuits: any[] = [];

  constructor(private http: HttpClient) {
    super();
  }

  ngOnInit(): void {
    this.http
      .get<any[]>('./../../../assets/json/circuitos2025.json')
      .subscribe((data) => {
        this.circuits = data;
        //console.log('Circuitos:', this.circuits);  // Aquí podemos ver los circuitos cargados del JSON
      });
  }
}
