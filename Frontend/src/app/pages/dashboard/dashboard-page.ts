import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/auth';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import type { DashboardNavItem } from './layout/dashboard-nav/dashboard-nav';
import { DashboardFacade } from './services/dashboard-facade';
import { MensajesPanel } from './services/mensajes-panel';
import { OportunidadPanel } from './services/oportunidad-panel';
import { OrganizacionPanel } from './services/organizacion-panel';
import { PostulacionPanel } from './services/postulacion-panel';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DashboardLayout, RouterOutlet],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  protected readonly data = inject(DashboardFacade);
  protected readonly auth = inject(AuthService);
  readonly #postulacionPanel = inject(PostulacionPanel);
  readonly #organizacionPanel = inject(OrganizacionPanel);
  readonly #oportunidadPanel = inject(OportunidadPanel);
  readonly #mensajesPanel = inject(MensajesPanel);
  readonly #destroyRef = inject(DestroyRef);

  protected readonly dashboardNavItems: DashboardNavItem[] = [
    {
      id: 'grupo-oportunidades',
      label: 'Oportunidades',
      children: [
        { id: 'dashboard-tab-feed', label: 'Explorar', routerLink: '/panel/feed' },
        { id: 'dashboard-tab-postulaciones', label: 'Mis postulaciones', routerLink: '/panel/postulaciones' },
      ],
    },
    {
      id: 'grupo-organizacion',
      label: 'Mi organización',
      children: [
        { id: 'dashboard-tab-mis-organizaciones', label: 'Mis organizaciones', routerLink: '/panel/mis-organizaciones' },
        { id: 'dashboard-tab-publicaciones', label: 'Mis publicaciones', routerLink: '/panel/publicaciones' },
        { id: 'dashboard-tab-postulantes', label: 'Postulantes', routerLink: '/panel/postulantes' },
        { id: 'dashboard-tab-publicar', label: 'Publicar oferta', routerLink: '/panel/publicar' },
      ],
    },
    { id: 'dashboard-tab-mensajes', label: 'Mensajes', routerLink: '/panel/mensajes' },
  ];

  constructor() {
    this.#destroyRef.onDestroy(() => this.data.dispose());

    effect(() => {
      const epoch = this.auth.sesionEpoch();
      if (epoch === 0) {
        return;
      }
      if (this.auth.isLoggedIn()) {
        if (this.data.cargando()) {
          return;
        }
        const idUsuario = this.auth.userId();
        if (idUsuario === null) {
          return;
        }
        if (!this.data.sesionYaCargada(idUsuario)) {
          this.data.cargarParaUsuario(idUsuario);
        }
        return;
      }
      if (this.data.sesionYaCargada(null)) {
        return;
      }
      this.data.reiniciarDatosSesion();
      this.#postulacionPanel.limpiarEstadoUi();
      this.#organizacionPanel.limpiarEstadoUi();
      this.#oportunidadPanel.limpiarEstadoUi();
      this.#mensajesPanel.limpiarEstadoUi();
      this.data.cargarParaUsuario(null);
    });
  }
}
