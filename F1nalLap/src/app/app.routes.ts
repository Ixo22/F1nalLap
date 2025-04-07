import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'temp-actual', loadComponent: () => import('./pages/temp-actual/temp-actual.component').then(m => m.TempActualComponent) },
  { path: 'last-temps', loadComponent: () => import('./pages/last-temps/last-temps.component').then(m => m.LastTempsComponent) },
  { path: 'memorable-temps', loadComponent: () => import('./pages/memorable-temps/memorable-temps.component').then(m => m.MemorableTempsComponent) }
];
 

