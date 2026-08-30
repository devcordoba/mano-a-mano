import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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

  protected readonly hayFiltrosActivos = computed(() =>
    this.data.filtroCausa() !== null ||
    this.data.filtroTipoActividad() !== null ||
    this.data.busquedaFeed().trim() !== ''
  );

  readonly #expandedIds = signal<Set<number>>(new Set());

  protected isExpanded(id: number): boolean {
    return this.#expandedIds().has(id);
  }

  protected toggleExpanded(id: number): void {
    this.#expandedIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

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

  protected onFiltroCausa(event: Event): void {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }
    this.data.setFiltroCausa(select.value === '' ? null : Number(select.value));
  }

  protected onFiltroTipoActividad(event: Event): void {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }
    this.data.setFiltroTipoActividad(select.value === '' ? null : Number(select.value));
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
