import { NgModule, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';


// Angular Material
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';



// INICIO SERVICIOS
import { CargarScriptsService } from './cargar-scripts.service';
// FIN SERVICIOS

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppComponent,
    HttpClientModule,
    MatMenuModule,
    MatButtonModule,
    MatMenuTrigger
  ],
  providers: [
    CargarScriptsService
  ]
})
export class AppModule { 

  
}