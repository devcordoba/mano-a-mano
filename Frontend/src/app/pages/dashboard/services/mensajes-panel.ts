import {
  afterNextRender,
  computed,
  DestroyRef,
  Injectable,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators, type FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth';
import { ManoHttpClient } from '@shared/services/mano-http-client';
import { mensajeErrorHttp } from '@shared/utils/http-error';
import { propietarioOrganizacionDePostulacion } from '@shared/utils/postulacion-organizacion';
import type { Mensaje, MensajeAlta, Postulacion } from '@shared/models/api-types';
import { DashboardFacade } from './dashboard-facade';

interface MensajePostulacionContexto {
  destinatario: number;
  oportunidadId: number | null;
}

@Injectable()
export class MensajesPanel {
  readonly #api = inject(ManoHttpClient);
  readonly #auth = inject(AuthService);
  readonly #router = inject(Router);
  readonly #formBuilder = inject(NonNullableFormBuilder);
  readonly #injector = inject(Injector);
  readonly #destroyRef = inject(DestroyRef);
  readonly data = inject(DashboardFacade);

  readonly avisoComposeMensajes = signal<string | null>(null);
  readonly contextoMensaje = signal<MensajePostulacionContexto | null>(null);
  readonly conversacionActivaPostulacionId = signal<number | null>(null);
  readonly scrollComposeTick = signal(0);

  readonly formularioMensajeContextual = this.#formBuilder.group({
    cuerpo: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(4000)],
    }),
  }) satisfies {
    controls: {
      cuerpo: FormControl<string>;
    };
  };

  limpiarEstadoUi(): void {
    this.contextoMensaje.set(null);
    this.conversacionActivaPostulacionId.set(null);
    this.avisoComposeMensajes.set(null);
    this.formularioMensajeContextual.reset({ cuerpo: '' });
  }

  readonly bandejaHilo = computed((): Mensaje[] => {
    const contexto = this.contextoMensaje();
    const idUsuario = this.#auth.userId();
    const recibidos = this.data.bandejaRecibidos();
    const enviados = this.data.bandejaEnviados();

    if (contexto === null || idUsuario === null) {
      return [];
    }

    const idOportunidad = contexto.oportunidadId;
    const idDestinatario = contexto.destinatario;
    const mensajesPorId = new Map<number, Mensaje>();

    const todos = recibidos.concat(enviados);
    for (const mensaje of todos) {
      mensajesPorId.set(mensaje.id, mensaje);
    }

    const hilos: Mensaje[] = [];
    for (const mensaje of mensajesPorId.values()) {
      if (idOportunidad !== null) {
        if (mensaje.oportunidad === null || mensaje.oportunidad !== idOportunidad) {
          continue;
        }
      }

      const esSaliente =
        mensaje.remitente === idUsuario && mensaje.destinatario === idDestinatario;
      const esEntrante =
        mensaje.remitente === idDestinatario && mensaje.destinatario === idUsuario;

      if (esSaliente || esEntrante) {
        hilos.push(mensaje);
      }
    }

    hilos.sort(
      (mensajeA, mensajeB) =>
        new Date(mensajeA.created_at).getTime() - new Date(mensajeB.created_at).getTime(),
    );

    return hilos;
  });

  abrirHiloOrganizacion(postulacion: Postulacion, oportunidadId: number): void {
    this.avisoComposeMensajes.set(null);
    this.conversacionActivaPostulacionId.set(postulacion.id);
    this.contextoMensaje.set({ destinatario: postulacion.voluntario, oportunidadId });
    this.formularioMensajeContextual.reset({ cuerpo: '' });
    this.#enfocarCompose();
  }

  abrirHiloVoluntario(postulacion: Postulacion): void {
    if (!this.#auth.isLoggedIn()) {
      this.#router.navigate(['/login'], { queryParams: { returnUrl: '/panel/mensajes' } });
      return;
    }

    const idPropietario = propietarioOrganizacionDePostulacion(postulacion);
    if (idPropietario === null) {
      this.data.reportarError(
        'No se pudo abrir la conversación: faltan datos de la organización. Recargá el panel.',
      );
      return;
    }

    this.#establecerHiloVoluntario(postulacion, idPropietario);
  }

  enviarMensajeContextual(): void {
    const contexto = this.contextoMensaje();

    if (!this.#auth.isLoggedIn()) {
      this.#router.navigate(['/login'], { queryParams: { returnUrl: '/panel/mensajes' } });
      return;
    }

    if (contexto === null) {
      this.avisoComposeMensajes.set('Elegí una conversación de la lista de la izquierda.');
      return;
    }

    this.avisoComposeMensajes.set(null);
    this.formularioMensajeContextual.markAllAsTouched();
    if (this.formularioMensajeContextual.invalid) {
      return;
    }

    const cuerpo = this.formularioMensajeContextual.getRawValue().cuerpo;
    const payload: MensajeAlta = {
      destinatario: contexto.destinatario,
      cuerpo,
    };

    if (contexto.oportunidadId !== null) {
      payload.oportunidad = contexto.oportunidadId;
    }

    this.#api
      .createMensaje(payload)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (mensaje) => {
          this.formularioMensajeContextual.reset({ cuerpo: '' });
          this.data.limpiarError();
          this.data.registrarMensajeEnviado(mensaje);
        },
        error: (error: unknown) => this.data.reportarError(mensajeErrorHttp(error)),
      });
  }

  #establecerHiloVoluntario(postulacion: Postulacion, idDestinatario: number): void {
    this.data.limpiarError();
    this.avisoComposeMensajes.set(null);
    this.conversacionActivaPostulacionId.set(postulacion.id);
    this.contextoMensaje.set({
      destinatario: idDestinatario,
      oportunidadId: postulacion.oportunidad,
    });
    this.formularioMensajeContextual.reset({ cuerpo: '' });
    this.#enfocarCompose();
  }

  #enfocarCompose(): void {
    afterNextRender(
      () => {
        this.scrollComposeTick.update((valor) => valor + 1);
      },
      { injector: this.#injector },
    );
  }
}
