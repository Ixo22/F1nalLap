import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-circuits',
  standalone: true, 
  imports: [CommonModule, HttpClientModule], // <-- aquí va CommonModule
  templateUrl: './circuits.component.html',
  styleUrl: './circuits.component.scss'
})
export class CircuitsComponent implements OnInit {
  circuits: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('./../../../assets/json/circuitos2025.json')
      .subscribe(data => this.circuits = data);
  }
}
