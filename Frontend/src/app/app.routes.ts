import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'inicio',
    title: 'Inicio - Mano a Mano',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'nosotros',
    title: 'Quiénes somos - Mano a Mano',
    loadComponent: () =>
      import('./pages/quienes-somos/quienes-somos').then((m) => m.QuienesSomosPage),
  },
  {
    path: 'login',
    title: 'Iniciar sesión - Mano a Mano',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'panel',
    title: 'Panel - Mano a Mano',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardPage),
  },
  { path: '**', redirectTo: 'inicio' },
];
