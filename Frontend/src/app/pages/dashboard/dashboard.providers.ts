import { DashboardFacade } from './services/dashboard-facade';
import { MensajesPanel } from './services/mensajes-panel';
import { OportunidadPanel } from './services/oportunidad-panel';
import { OrganizacionPanel } from './services/organizacion-panel';
import { PostulacionPanel } from './services/postulacion-panel';

export const dashboardProviders = [
  DashboardFacade,
  OrganizacionPanel,
  OportunidadPanel,
  PostulacionPanel,
  MensajesPanel,
];
