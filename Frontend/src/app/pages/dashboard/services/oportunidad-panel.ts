import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { FormControl } from '@angular/forms';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ApiConfig } from '@core/http/api-config';
import { ManoHttpClient } from '@shared/services/mano-http-client';
import { textoOpcional } from '@shared/utils/texto-opcional';
import { urlImagenOportunidad } from '@shared/utils/oportunidad-visual';
import { mensajeErrorHttp } from '@shared/utils/http-error';
import type { OportunidadVoluntariado, Organizacion } from '@shared/models/api-types';
import { DashboardFacade } from './dashboard-facade';
import { rutaPanelTab } from '../dashboard-tab-paths';

@Injectable()
export class OportunidadPanel {
  readonly #api = inject(ManoHttpClient);
  readonly #apiConfig = inject(ApiConfig);
  readonly #formBuilder = inject(NonNullableFormBuilder);
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);
  readonly data = inject(DashboardFacade);

  readonly oportunidadEditandoId = signal<number | null>(null);
  readonly imagenPreviewUrl = signal<string | null>(null);

  readonly oportunidadForm = this.#formBuilder.group({
    titulo: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(200)],
    }),
    descripcion: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(8000)],
    }),
    ubicacion: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
    }),
    causa: this.#formBuilder.control<number | null>(null, { validators: [Validators.required] }),
    tipo_actividad: this.#formBuilder.control<number | null>(null, {
      validators: [Validators.required],
    }),
    disponibilidad: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
    }),
    requisitos: this.#formBuilder.control('', { validators: [Validators.maxLength(4000)] }),
    cupos: this.#formBuilder.control(1, {
      validators: [Validators.required, Validators.min(1), Validators.max(999)],
    }),
    fecha_actividad: this.#formBuilder.control<string>(''),
    imagen: this.#formBuilder.control<File | null>(null),
  }) satisfies {
    controls: {
      titulo: FormControl<string>;
      descripcion: FormControl<string>;
      ubicacion: FormControl<string>;
      causa: FormControl<number | null>;
      tipo_actividad: FormControl<number | null>;
      disponibilidad: FormControl<string>;
      requisitos: FormControl<string>;
      cupos: FormControl<number>;
      fecha_actividad: FormControl<string>;
      imagen: FormControl<File | null>;
    };
  };

  limpiarEstadoUi(): void {
    this.oportunidadEditandoId.set(null);
    this.limpiarImagenOportunidad();
    this.oportunidadForm.reset({
      titulo: '',
      descripcion: '',
      ubicacion: '',
      causa: null,
      tipo_actividad: null,
      disponibilidad: '',
      requisitos: '',
      cupos: 1,
      fecha_actividad: '',
      imagen: null,
    });
  }

  limpiarImagenOportunidad(): void {
    const previewAnterior = this.imagenPreviewUrl();
    if (previewAnterior !== null && previewAnterior.startsWith('blob:')) {
      URL.revokeObjectURL(previewAnterior);
    }
    this.oportunidadForm.controls.imagen.setValue(null);
    this.imagenPreviewUrl.set(null);
  }

  onImagenPreviewUrl(url: string | null): void {
    const previewAnterior = this.imagenPreviewUrl();
    if (
      previewAnterior !== null &&
      previewAnterior.startsWith('blob:') &&
      previewAnterior !== url
    ) {
      URL.revokeObjectURL(previewAnterior);
    }
    this.imagenPreviewUrl.set(url);
  }

  organizacionParaPublicar(): Organizacion | null {
    const organizaciones = this.data.misOrganizaciones();
    if (organizaciones.length === 0) {
      return null;
    }

    const id = this.data.idOrganizacionPublicar();
    if (id !== null) {
      for (const organizacion of organizaciones) {
        if (organizacion.id === id) {
          return organizacion;
        }
      }
    }

    return organizaciones[0] ?? null;
  }

  onCambioSelectOrganizacionPublicar(event: Event): void {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) {
      return;
    }
    if (select.value === '') {
      return;
    }

    const id = Number(select.value);
    if (Number.isFinite(id)) {
      this.data.setIdOrganizacionPublicar(id);
      this.cancelarEdicionOportunidad();
    }
  }

  prepararEdicionOportunidad(oportunidad: OportunidadVoluntariado): void {
    this.data.setIdOrganizacionPublicar(oportunidad.organizacion);
    this.oportunidadEditandoId.set(oportunidad.id);

    let fechaInput = '';
    const fecha = oportunidad.fecha_actividad;
    if (typeof fecha === 'string' && fecha.length >= 10) {
      fechaInput = fecha.slice(0, 10);
    } else if (fecha) {
      fechaInput = String(fecha).slice(0, 10);
    }

    this.oportunidadForm.patchValue({
      titulo: oportunidad.titulo,
      descripcion: oportunidad.descripcion,
      ubicacion: oportunidad.ubicacion,
      causa: oportunidad.causa,
      tipo_actividad: oportunidad.tipo_actividad,
      disponibilidad: oportunidad.disponibilidad,
      requisitos: textoOpcional(oportunidad.requisitos),
      cupos: oportunidad.cupos,
      fecha_actividad: fechaInput,
      imagen: null,
    });

    this.limpiarImagenOportunidad();
    if (oportunidad.tiene_imagen) {
      this.imagenPreviewUrl.set(
        urlImagenOportunidad(this.#apiConfig.apiUrl, oportunidad.id, oportunidad.updated_at),
      );
    }
  }

  cancelarEdicionOportunidad(): void {
    this.limpiarEstadoUi();
  }

  guardarOportunidad(): void {
    this.oportunidadForm.markAllAsTouched();
    if (this.oportunidadForm.invalid) {
      this.data.reportarError(
        'Revisá el formulario: descripción mín. 10 caracteres; título mín. 5; completá ubicación, causa, tipo de actividad y disponibilidad.',
      );
      return;
    }

    const organizacion = this.organizacionParaPublicar();
    if (organizacion === null) {
      this.data.reportarError('Elegí una organización o creá una ficha en Mis organizaciones.');
      return;
    }

    const valores = this.oportunidadForm.getRawValue();
    if (valores.causa === null || valores.tipo_actividad === null) {
      return;
    }

    const fechaTexto = textoOpcional(valores.fecha_actividad).trim();
    let fechaActividad: string | null = null;
    if (fechaTexto !== '') {
      fechaActividad = fechaTexto;
    }

    const payload = {
      titulo: valores.titulo,
      descripcion: valores.descripcion,
      ubicacion: valores.ubicacion,
      causa: valores.causa,
      tipo_actividad: valores.tipo_actividad,
      disponibilidad: valores.disponibilidad,
      requisitos: textoOpcional(valores.requisitos),
      cupos: valores.cupos,
      fecha_actividad: fechaActividad,
    };

    const idEditando = this.oportunidadEditandoId();
    const imagen = valores.imagen;
    const body = { ...payload, organizacion: organizacion.id, activa: true as const };
    const eraEdicion = idEditando !== null;

    let peticion;
    if (eraEdicion) {
      peticion = this.#api.updateOportunidad(idEditando, body, imagen);
    } else {
      peticion = this.#api.createOportunidad(body, imagen);
    }

    peticion.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe({
      next: (oportunidad) => {
        this.data.limpiarError();
        this.data.upsertOportunidad(oportunidad);
        this.limpiarEstadoUi();
        if (!eraEdicion) {
          void this.#router.navigate(rutaPanelTab('publicaciones'));
        }
      },
      error: (error: unknown) => {
        this.data.reportarError(mensajeErrorHttp(error));
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.limpiarEstadoUi();
        }
      },
    });
  }

  toggleActiva(oportunidad: OportunidadVoluntariado): void {
    this.#api
      .updateOportunidad(oportunidad.id, { activa: !oportunidad.activa })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (actualizada) => {
          this.data.limpiarError();
          this.data.upsertOportunidad(actualizada);
        },
        error: (error: unknown) => this.data.reportarError(mensajeErrorHttp(error)),
      });
  }

  eliminarOportunidad(id: number): void {
    if (!confirm('¿Eliminar esta oportunidad?')) {
      return;
    }
    this.#api
      .deleteOportunidad(id)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.data.quitarOportunidad(id);
        },
        error: (error: unknown) => this.data.reportarError(mensajeErrorHttp(error)),
      });
  }
}
