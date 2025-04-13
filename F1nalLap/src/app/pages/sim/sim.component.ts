import { Component } from '@angular/core';
import { CargarScriptsService } from './../../cargar-scripts.service';

@Component({
  selector: 'app-sim',
  imports: [],
  templateUrl: './sim.component.html',
  styleUrl: './sim.component.scss'
})
export class SimComponent {
  constructor( private _CargaScripts : CargarScriptsService ) {
    _CargaScripts.Carga( [ "tarjetas" ] );
  }
}
