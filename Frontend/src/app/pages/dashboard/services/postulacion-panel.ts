import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth';
import { ManoHttpClient } from '@shared/services/mano-http-client';
import { mensajeErrorHttp, mensajeErrorUniqueConstraint } from '@shared/utils/http-error';
import type { Postulacion } from '@shared/models/api-types';
import { DashboardFacade } from './dashboard-facade';

@Injectable()
export class PostulacionPanel {
  readonly #api = inject(ManoHttpClient);
  readonly #destroyRef = inject(DestroyRef);
  readonly #auth = inject(AuthService);
  readonly #router = inject(Router);
  readonly data = inject(DashboardFacade);

  readonly #estadoBorradorPostulacion = signal<Record<number, Postulacion['estado']>>({});

  limpiarEstadoUi(): void {
    this.#estadoBorradorPostulacion.set({});
  }

  onPostularmeClick(oportunidadId: number): void {
    if (!this.#auth.isLoggedIn()) {
      this.#router.navigate(['/login'], { queryParams: { returnUrl: '/panel/feed' } });
      return;
    }
    this.postular(oportunidadId);
  }

  puedeGestionarPostulantes(): boolean {
    return this.data.misOrganizaciones().length > 0;
  }

  estadoSelectPara(postulacion: Postulacion): Postulacion['estado'] {
    const borrador = this.#estadoBorradorPostulacion()[postulacion.id];
    if (borrador !== undefined) {
      return borrador;
    }
    return postulacion.estado;
  }

  onEstadoSelectNativeChange(postulacion: Postulacion, event: Event): void {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }
    const nuevoEstado = select.value as Postulacion['estado'];
    if (nuevoEstado === postulacion.estado) {
      this.#quitarBorradorEstado(postulacion.id);
    } else {
      this.#guardarBorradorEstado(postulacion.id, nuevoEstado);
    }
  }

  guardarEstadoPostulacion(postulacion: Postulacion): void {
    const nuevoEstado = this.estadoSelectPara(postulacion);
    if (nuevoEstado === postulacion.estado) {
      return;
    }
    this.#api
      .updatePostulacion(postulacion.id, { estado: nuevoEstado })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (actualizada) => {
          this.data.limpiarError();
          this.#quitarBorradorEstado(postulacion.id);
          this.data.reemplazarPostulacion(actualizada);
        },
        error: (error: unknown) => {
          this.data.reportarError(mensajeErrorHttp(error));
          this.data.recargarSegunSesion();
        },
      });
  }

  postular(oportunidadId: number): void {
    const idUsuario = this.#auth.userId();
    if (idUsuario === null) {
      return;
    }
    this.#api
      .createPostulacion({ oportunidad: oportunidadId })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (postulacion) => {
          this.data.limpiarError();
          this.data.registrarPostulacionVoluntario(postulacion);
        },
        error: (error: unknown) => {
          this.data.reportarError(this.#mensajeErrorPostulacion(error));
          if (
            mensajeErrorUniqueConstraint(error, 'Ya te has postulado a esta propuesta.') !==
            null
          ) {
            this.data.recargarSegunSesion();
          }
        },
      });
  }

  #mensajeErrorPostulacion(error: unknown): string {
    const duplicada = mensajeErrorUniqueConstraint(
      error,
      'Ya te has postulado a esta propuesta.',
    );
    if (duplicada !== null) {
      return duplicada;
    }
    return mensajeErrorHttp(error);
  }

  #guardarBorradorEstado(postulacionId: number, estado: Postulacion['estado']): void {
    this.#estadoBorradorPostulacion.set({
      ...this.#estadoBorradorPostulacion(),
      [postulacionId]: estado,
    });
  }

  #quitarBorradorEstado(postulacionId: number): void {
    const mapa = { ...this.#estadoBorradorPostulacion() };
    delete mapa[postulacionId];
    this.#estadoBorradorPostulacion.set(mapa);
  }
}
