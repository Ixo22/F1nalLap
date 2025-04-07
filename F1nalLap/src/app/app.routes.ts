import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'temp-actual', loadComponent: () => import('./pages/temp-actual/temp-actual.component').then(m => m.TempActualComponent) }
];
 

