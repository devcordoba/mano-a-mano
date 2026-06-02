import { Routes } from '@angular/router';
import { guestGuard } from '@core/guards/auth-guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'inicio',
    title: 'Inicio - Mano a Mano',
    loadComponent: () => import('app/pages/inicio/home-page').then((m) => m.HomePage),
  },
  {
    path: 'nosotros',
    title: 'Quiénes somos - Mano a Mano',
    loadComponent: () =>
      import('app/pages/nosotros/quienes-somos-page').then((m) => m.QuienesSomosPage),
  },
  {
    path: 'login',
    title: 'Iniciar sesión - Mano a Mano',
    canActivate: [guestGuard],
    loadComponent: () => import('app/pages/login/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'panel',
    loadChildren: () =>
      import('app/pages/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
  },
  {
    path: 'error-navegacion',
    title: 'Error de navegación - Mano a Mano',
    loadComponent: () =>
      import('app/pages/error/navigation-error-page').then((m) => m.NavigationErrorPage),
  },
  {
    path: '**',
    title: 'No encontrado - Mano a Mano',
    loadComponent: () => import('app/pages/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
