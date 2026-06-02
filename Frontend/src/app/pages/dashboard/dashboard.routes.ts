import { Routes } from '@angular/router';
import { dashboardAuthChildGuard } from '@core/guards/auth-guards';
import { DashboardFeedTab } from './feed/dashboard-feed-tab';
import { DashboardMensajesTab } from './mensajes/dashboard-mensajes-tab';
import { DashboardOrganizacionesTab } from './organizaciones/dashboard-organizaciones-tab';
import { DashboardPostulacionesTab } from './postulaciones/dashboard-postulaciones-tab';
import { DashboardPostulantesTab } from './postulantes/dashboard-postulantes-tab';
import { DashboardPublicacionesTab } from './publicaciones/dashboard-publicaciones-tab';
import { DashboardPublicarTab } from './publicar/dashboard-publicar-tab';
import { dashboardProviders } from './dashboard.providers';
import { panelDataResolver } from './resolvers/panel-data.resolver';

export const dashboardRoutes: Routes = [
  {
    path: '',
    title: 'Panel - Mano a Mano',
    providers: dashboardProviders,
    canActivateChild: [dashboardAuthChildGuard],
    resolve: { panelListo: panelDataResolver },
    loadComponent: () => import('./dashboard-page').then((m) => m.DashboardPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'feed' },
      { path: 'feed', component: DashboardFeedTab },
      { path: 'postulaciones', component: DashboardPostulacionesTab },
      { path: 'publicaciones', component: DashboardPublicacionesTab },
      { path: 'postulantes', component: DashboardPostulantesTab },
      { path: 'mensajes', component: DashboardMensajesTab },
      { path: 'mis-organizaciones', component: DashboardOrganizacionesTab },
      { path: 'publicar', component: DashboardPublicarTab },
    ],
  },
];
