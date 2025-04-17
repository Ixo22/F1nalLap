import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

// INICIO SERVICIOS
import { CargarScriptsService } from './cargar-scripts.service';
// FIN SERVICIOS



@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppComponent,
    HttpClientModule
  ],
  providers: [
    CargarScriptsService
  ]
})
export class AppModule { }