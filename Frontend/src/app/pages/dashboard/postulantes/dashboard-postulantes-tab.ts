import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Postulacion } from '@shared/models/api-types';
import { getNombreVoluntario } from '@shared/utils/postulacion-labels';
import { DashboardFacade } from '../services/dashboard-facade';
import { MensajesPanel } from '../services/mensajes-panel';
import { PostulacionPanel } from '../services/postulacion-panel';

interface PostulanteItemView {
  postulacion: Postulacion;
  nombreVoluntario: string;
  cancelada: boolean;
  estadoSelect: Postulacion['estado'];
  botonGuardarDeshabilitado: boolean;
  tituloBotonGuardar: string | null;
  muestraBotonEscribir: boolean;
  puedeGestionar: boolean;
}

@Component({
  selector: 'app-dashboard-postulantes-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './dashboard-postulantes-tab.html',
})
export class DashboardPostulantesTab {
  protected readonly data = inject(DashboardFacade);
  protected readonly postulaciones = inject(PostulacionPanel);
  protected readonly mensajes = inject(MensajesPanel);

  protected readonly bloques = computed(() => {
    const puedeGestionar = this.postulaciones.puedeGestionarPostulantes();

    return this.data.postulacionesBloques().map((bloque) => ({
      ...bloque,
      items: bloque.items.map((postulacion): PostulanteItemView => {
        const estadoSelect = this.postulaciones.estadoSelectPara(postulacion);
        const hayCambio = estadoSelect !== postulacion.estado;

        return {
          postulacion,
          nombreVoluntario: getNombreVoluntario(postulacion),
          cancelada: postulacion.estado === 'CAN',
          estadoSelect,
          botonGuardarDeshabilitado: !hayCambio,
          tituloBotonGuardar: hayCambio ? null : 'No hay cambios para guardar.',
          muestraBotonEscribir:
            puedeGestionar && postulacion.estado === 'ACE' && estadoSelect === 'ACE',
          puedeGestionar,
        };
      }),
    }));
  });
}
