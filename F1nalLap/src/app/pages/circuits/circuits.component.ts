import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // 👈 ¡esto es lo que faltaba!

@Component({
  selector: 'app-circuits',
  standalone: true, 
  imports: [CommonModule, HttpClientModule, RouterModule], // 👈 lo añades aquí
  templateUrl: './circuits.component.html',
  styleUrl: './circuits.component.scss'
})
export class CircuitsComponent implements OnInit {
  circuits: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
  this.http.get<any[]>('./../../../assets/json/circuitos2025.json')
    .subscribe(data => {
      this.circuits = data;
      console.log('Circuitos:', this.circuits);  // Aquí puedes ver que el array tiene los datos correctos
    });
}

}
