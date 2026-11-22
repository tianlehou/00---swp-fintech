import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingComponent),
    title: 'Fiado Digital — Cobrá a tiempo y construí historial',
  },
  { path: '**', redirectTo: '' },
];