import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/auth/auth';
import { ManoHttpClient } from '@shared/services/mano-http-client';
import { mensajeErrorHttp } from '@shared/utils/http-error';
import type { Organizacion } from '@shared/models/api-types';
import { textoOpcional } from '@shared/utils/texto-opcional';
import { DashboardFacade } from './dashboard-facade';

function optionalHttpUrl(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let raw = '';
    if (control.value !== null && control.value !== undefined) {
      raw = String(control.value).trim();
    }

    if (raw === '') {
      return null;
    }

    let urlConEsquema = raw;
    if (!/^https?:\/\//i.test(raw)) {
      urlConEsquema = `https://${raw}`;
    }

    try {
      const url = new URL(urlConEsquema);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { httpUrl: true };
      }
      return null;
    } catch {
      return { httpUrl: true };
    }
  };
}

@Injectable()
export class OrganizacionPanel {
  readonly #api = inject(ManoHttpClient);
  readonly #auth = inject(AuthService);
  readonly #formBuilder = inject(NonNullableFormBuilder);
  readonly #destroyRef = inject(DestroyRef);
  readonly data = inject(DashboardFacade);

  readonly organizacionEditandoId = signal<number | null>(null);
  readonly mostrarFormularioOrganizacion = signal(false);

  readonly organizacionForm = this.#formBuilder.group({
    nombre_publico: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
    }),
    email_contacto: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    descripcion: this.#formBuilder.control('', { validators: [Validators.maxLength(4000)] }),
    telefono: this.#formBuilder.control('', { validators: [Validators.maxLength(40)] }),
    sitio_web: this.#formBuilder.control('', {
      validators: [Validators.maxLength(200), optionalHttpUrl()],
    }),
  }) satisfies {
    controls: {
      nombre_publico: FormControl<string>;
      email_contacto: FormControl<string>;
      descripcion: FormControl<string>;
      telefono: FormControl<string>;
      sitio_web: FormControl<string>;
    };
  };

  limpiarEstadoUi(): void {
    this.organizacionEditandoId.set(null);
    this.mostrarFormularioOrganizacion.set(false);
    this.#resetFormularioOrganizacion();
  }

  guardarOrganizacion(): void {
    this.organizacionForm.markAllAsTouched();
    if (this.organizacionForm.invalid) {
      return;
    }

    const idUsuario = this.#auth.userId();
    if (idUsuario === null) {
      this.data.reportarError('Para crear una organización tenés que iniciar sesión.');
      return;
    }

    const valores = this.organizacionForm.getRawValue();
    const sitioWeb = textoOpcional(valores.sitio_web).trim();
    const idEditando = this.organizacionEditandoId();
    const payload = {
      nombre_publico: valores.nombre_publico,
      email_contacto: valores.email_contacto,
      descripcion: textoOpcional(valores.descripcion),
      telefono: textoOpcional(valores.telefono),
      sitio_web: sitioWeb,
    };

    let peticion;
    if (idEditando !== null) {
      peticion = this.#api.updateOrganizacion(idEditando, payload);
    } else {
      if (this.data.misOrganizaciones().length > 0) {
        this.data.reportarError('Ya tenés una organización registrada.');
        return;
      }
      peticion = this.#api.createOrganizacion(payload);
    }

    peticion.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe({
      next: (organizacion) => {
        this.data.limpiarError();
        const eraCreacion = idEditando === null;
        this.data.upsertOrganizacion(organizacion);
        this.cancelarEdicionOrganizacion();
        if (eraCreacion) {
          this.data.recargarSegunSesion();
        }
      },
      error: (error: unknown) => this.data.reportarError(mensajeErrorHttp(error)),
    });
  }

  editarOrganizacion(organizacion: Organizacion): void {
    this.organizacionEditandoId.set(organizacion.id);
    this.mostrarFormularioOrganizacion.set(true);
    this.organizacionForm.patchValue({
      nombre_publico: organizacion.nombre_publico,
      email_contacto: organizacion.email_contacto,
      descripcion: textoOpcional(organizacion.descripcion),
      telefono: textoOpcional(organizacion.telefono),
      sitio_web: textoOpcional(organizacion.sitio_web),
    });
  }

  nuevaOrganizacion(): void {
    if (this.data.misOrganizaciones().length > 0) {
      return;
    }
    this.organizacionEditandoId.set(null);
    this.mostrarFormularioOrganizacion.set(true);
    this.#resetFormularioOrganizacion();
  }

  cancelarEdicionOrganizacion(): void {
    this.organizacionEditandoId.set(null);
    this.mostrarFormularioOrganizacion.set(false);
    this.#resetFormularioOrganizacion();
  }

  eliminarOrganizacion(organizacion: Organizacion): void {
    if (!confirm(`¿Eliminar la organización «${organizacion.nombre_publico}» y sus convocatorias?`)) {
      return;
    }
    this.#api
      .deleteOrganizacion(organizacion.id)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
      next: () => {
        this.data.quitarOrganizacion(organizacion.id);
        this.cancelarEdicionOrganizacion();
        this.data.recargarSegunSesion();
      },
      error: (error: unknown) => this.data.reportarError(mensajeErrorHttp(error)),
    });
  }

  #resetFormularioOrganizacion(): void {
    this.organizacionForm.reset({
      nombre_publico: '',
      email_contacto: '',
      descripcion: '',
      telefono: '',
      sitio_web: '',
    });
  }
}
