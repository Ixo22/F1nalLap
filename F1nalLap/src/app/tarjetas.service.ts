// src/app/tarjetas.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TarjetasService {
  private tarjetas: any[] = [];
  private tarjetaSeleccionada: any;

  constructor() {}

  // Método para establecer las tarjetas cargadas
  setTarjetas(tarjetas: any[]) {
    this.tarjetas = tarjetas;
  }

  // Método para obtener todas las tarjetas
  getTarjetas() {
    return this.tarjetas;
  }

  // Método para establecer la tarjeta seleccionada
  setTarjetaSeleccionada(tarjeta: any) {
    this.tarjetaSeleccionada = tarjeta;
  }

  // Método para obtener la tarjeta seleccionada
  getTarjetaSeleccionada() {
    return this.tarjetaSeleccionada;
  }
}
