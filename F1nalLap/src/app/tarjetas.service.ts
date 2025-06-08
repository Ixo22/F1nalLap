import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TarjetasService {
  private tarjetas: any[] = [];
  private tarjetaSeleccionada: any;

  constructor() {}

  setTarjetas(tarjetas: any[]) {
    this.tarjetas = tarjetas;
  }

  getTarjetas() {
    return this.tarjetas;
  }

  setTarjetaSeleccionada(tarjeta: any) {
    this.tarjetaSeleccionada = tarjeta;
  }

  getTarjetaSeleccionada() {
    return this.tarjetaSeleccionada;
  }
}
