import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// INICIO SERVICIOS
import { CargarScriptsService } from './cargar-scripts.service';
// FIN SERVICIOS



@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppComponent
  ],
  providers: [
    CargarScriptsService
  ]
})
export class AppModule { }