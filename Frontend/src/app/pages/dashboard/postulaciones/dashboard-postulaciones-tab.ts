import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Postulacion } from '@shared/models/api-types';
import {
  getEstadoPostulacionLegible,
  getTituloOportunidad,
} from '@shared/utils/postulacion-labels';
import { DashboardFacade } from '../services/dashboard-facade';
import { MensajesPanel } from '../services/mensajes-panel';

interface PostulacionItemView {
  postulacion: Postulacion;
  tituloOportunidad: string;
  estadoLegible: string;
}

@Component({
  selector: 'app-dashboard-postulaciones-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard-postulaciones-tab.html',
})
export class DashboardPostulacionesTab {
  protected readonly data = inject(DashboardFacade);
  protected readonly mensajes = inject(MensajesPanel);

  protected readonly items = computed((): PostulacionItemView[] =>
    this.data.misPostulaciones().map((postulacion) => ({
      postulacion,
      tituloOportunidad: getTituloOportunidad(postulacion),
      estadoLegible: getEstadoPostulacionLegible(postulacion.estado),
    })),
  );
}
