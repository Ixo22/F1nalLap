import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'actual', loadComponent: () => import('./pages/temp-actual/temp-actual.component').then(m => m.TempActualComponent) },
  { path: 'last', loadComponent: () => import('./pages/last-temps/last-temps.component').then(m => m.LastTempsComponent) },
  { path: 'memorable', loadComponent: () => import('./pages/memorable-temps/memorable-temps.component').then(m => m.MemorableTempsComponent) },
  { path: 'circuits', loadComponent: () => import('./pages/circuits/circuits.component').then(m => m.CircuitsComponent) },
  { path: 'simulador', loadComponent: () => import('./pages/simulador/simulador.component').then(m => m.SimuladorComponent) }
];
 
