import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '@core/auth/auth';
import { ApiConfig } from '@core/http/api-config';
import type { OportunidadVoluntariado } from '@shared/models/api-types';
import { clasePaletaOportunidad, urlImagenOportunidad } from '@shared/utils/oportunidad-visual';
import { DashboardFacade } from '../services/dashboard-facade';
import { PostulacionPanel } from '../services/postulacion-panel';

interface OportunidadFeedView {
  oportunidad: OportunidadVoluntariado;
  imagenUrl: string | null;
  clasePaleta: string;
  organizacionNombre: string;
  tipoActividadNombre: string;
  puedePostularse: boolean;
  yaPostulo: boolean;
}

@Component({
  selector: 'app-dashboard-feed-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-feed-tab.html',
})
export class DashboardFeedTab {
  protected readonly data = inject(DashboardFacade);
  protected readonly postulaciones = inject(PostulacionPanel);
  protected readonly auth = inject(AuthService);
  readonly #apiConfig = inject(ApiConfig);

  protected readonly oportunidadesFeedView = computed((): OportunidadFeedView[] => {
    const feed = this.data.oportunidadesFeedVisibles();

    const postulaciones = this.data.misPostulaciones();
    const idsPostulados = new Set(postulaciones.map((postulacion) => postulacion.oportunidad));

    return feed.map((oportunidad) => ({
      oportunidad,
      imagenUrl: this.#resolverImagenUrl(oportunidad),
      clasePaleta: clasePaletaOportunidad(oportunidad.causa),
      organizacionNombre: this.#textoConFallback(oportunidad.organizacion_nombre, 'Organización'),
      tipoActividadNombre: this.#textoConFallback(oportunidad.tipo_actividad_nombre, 'Actividad'),
      puedePostularse: this.#puedePostularse(oportunidad, idsPostulados),
      yaPostulo: idsPostulados.has(oportunidad.id),
    }));
  });

  protected onBusquedaFeedInput(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    this.data.setBusquedaFeed(input.value);
  }

  protected onPostular(oportunidadId: number): void {
    this.postulaciones.onPostularmeClick(oportunidadId);
  }

  #puedePostularse(oportunidad: OportunidadVoluntariado, idsPostulados: Set<number>): boolean {
    if (!this.auth.isLoggedIn()) {
      return true;
    }
    if (!this.auth.esVoluntario()) {
      return false;
    }
    return !idsPostulados.has(oportunidad.id);
  }

  #resolverImagenUrl(oportunidad: OportunidadVoluntariado): string | null {
    if (oportunidad.tiene_imagen && oportunidad.id) {
      return urlImagenOportunidad(this.#apiConfig.apiUrl, oportunidad.id, oportunidad.updated_at);
    }
    return null;
  }

  #textoConFallback(valor: string | null | undefined, valorPorDefecto: string): string {
    if (valor !== null && valor !== undefined && valor !== '') {
      return valor;
    }
    return valorPorDefecto;
  }
}
