import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'actual',
    loadComponent: () =>
      import('./pages/temp-actual/temp-actual.component').then(
        (m) => m.TempActualComponent
      ),
  },
  {
    path: 'last',
    loadComponent: () =>
      import('./pages/last-temps/last-temps.component').then(
        (m) => m.LastTempsComponent
      ),
  },
  {
    path: 'memorable',
    loadComponent: () =>
      import('./pages/memorable-temps/memorable-temps.component').then(
        (m) => m.MemorableTempsComponent
      ),
  },
  {
    path: 'circuits',
    loadComponent: () =>
      import('./pages/circuits/circuits.component').then(
        (m) => m.CircuitsComponent
      ),
  },

  {
    path: 'ranking',
    loadComponent: () =>
      import('./pages/ranking/ranking.component').then(
        (m) => m.RankingComponent
      ),
  },

    {
    path: 'comparar',
    loadComponent: () =>
      import('./pages/comparar/comparar.component').then(
        (m) => m.CompararComponent
      ),
  },
  

  {
    path: 'prueba',
    loadComponent: () =>
      import('./pages/prueba/prueba.component').then(
        (m) => m.PruebaComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }