import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core/auth/auth';
import type { Postulacion } from '@shared/models/api-types';
import {
  esMensajeSaliente,
  getEstadoPostulacionLegible,
  getNombreRemitente,
  getNombreVoluntario,
  getTituloOportunidad,
} from '@shared/utils/postulacion-labels';
import { campoError } from '@shared/utils/error-campo';
import { createFormUiRevision } from '@shared/utils/track-form-ui';
import { DashboardFacade } from '../services/dashboard-facade';
import { MensajesPanel } from '../services/mensajes-panel';
import { PostulacionPanel } from '../services/postulacion-panel';

interface ConversacionOrganizacionItemView {
  postulacion: Postulacion;
  nombreVoluntario: string;
  estadoLegible: string;
}

interface ConversacionVoluntarioItemView {
  postulacion: Postulacion;
  tituloOportunidad: string;
  estadoLegible: string;
}

interface MensajeHiloItemView {
  mensajeId: number;
  cuerpo: string;
  createdAt: string;
  esSaliente: boolean;
  nombreRemitente: string;
  destinatarioUsername: string | undefined;
}

@Component({
  selector: 'app-dashboard-mensajes-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './dashboard-mensajes-tab.html',
})
export class DashboardMensajesTab {
  protected readonly data = inject(DashboardFacade);
  protected readonly mensajes = inject(MensajesPanel);
  protected readonly postulaciones = inject(PostulacionPanel);
  protected readonly auth = inject(AuthService);
  readonly #destroyRef = inject(DestroyRef);
  readonly #formUi = createFormUiRevision(
    this.mensajes.formularioMensajeContextual,
    this.#destroyRef,
  );

  protected readonly errorCuerpoMensaje = campoError(
    this.#formUi,
    this.mensajes.formularioMensajeContextual.controls.cuerpo,
    {
      required: 'Escribí un mensaje.',
      minlength: 'El mensaje debe tener al menos 5 caracteres.',
      maxlength: 'Máximo 4000 caracteres.',
    },
  );

  protected readonly vistaOrganizadorActiva = computed(
    () =>
      this.postulaciones.puedeGestionarPostulantes() &&
      this.data.postulacionesBloques().length > 0,
  );

  protected readonly hayConversaciones = computed(
    () => this.vistaOrganizadorActiva() || this.data.misPostulaciones().length > 0,
  );

  protected readonly mostrarListaVoluntario = computed(() => this.data.misPostulaciones().length > 0);

  protected readonly bloquesOrganizacion = computed(() =>
    this.data.postulacionesBloques().map((bloque) => ({
      titulo: bloque.titulo,
      oportunidadId: bloque.oportunidadId,
      items: bloque.items.map(
        (postulacion): ConversacionOrganizacionItemView => ({
          postulacion,
          nombreVoluntario: getNombreVoluntario(postulacion),
          estadoLegible: getEstadoPostulacionLegible(postulacion.estado),
        }),
      ),
    })),
  );

  protected readonly conversacionesVoluntario = computed((): ConversacionVoluntarioItemView[] =>
    this.data.misPostulaciones().map((postulacion) => ({
      postulacion,
      tituloOportunidad: getTituloOportunidad(postulacion),
      estadoLegible: getEstadoPostulacionLegible(postulacion.estado),
    })),
  );

  protected readonly hiloMensajes = computed((): MensajeHiloItemView[] => {
    const userId = this.auth.userId();
    return this.mensajes.bandejaHilo().map((mensaje) => ({
      mensajeId: mensaje.id,
      cuerpo: mensaje.cuerpo,
      createdAt: mensaje.created_at,
      esSaliente: esMensajeSaliente(mensaje, userId),
      nombreRemitente: getNombreRemitente(mensaje),
      destinatarioUsername: mensaje.destinatario_username,
    }));
  });

  protected readonly composeAnchor = viewChild<ElementRef<HTMLElement>>('composeAnchor');

  constructor() {
    effect(() => {
      this.mensajes.scrollComposeTick();
      const elemento = this.composeAnchor()?.nativeElement;
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }
}
