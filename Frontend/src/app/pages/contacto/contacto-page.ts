import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MamButton } from '@shared/components/mam-button/mam-button';
import { MamCard } from '@shared/components/mam-card/mam-card';
import { ManoHttpClient } from '@shared/services/mano-http-client';
import { campoError } from '@shared/utils/error-campo';
import { mensajeErrorHttp } from '@shared/utils/http-error';
import { createFormUiRevision } from '@shared/utils/track-form-ui';

@Component({
  selector: 'app-contacto-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MamCard, MamButton],
  templateUrl: './contacto-page.html',
})
export class ContactoPage {
  readonly #formBuilder = inject(NonNullableFormBuilder);
  readonly #http = inject(ManoHttpClient);
  readonly #destroyRef = inject(DestroyRef);

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.#formBuilder.group({
    nombre: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    }),
    email: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    asunto: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(160)],
    }),
    mensaje: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(10)],
    }),
  }) satisfies {
    controls: {
      nombre: FormControl<string>;
      email: FormControl<string>;
      asunto: FormControl<string>;
      mensaje: FormControl<string>;
    };
  };

  readonly #formUi = createFormUiRevision(this.formulario, this.#destroyRef);

  protected readonly errorNombre = campoError(this.#formUi, this.formulario.controls.nombre, {
    required: 'El nombre es obligatorio.',
    minlength: 'Mínimo 3 caracteres.',
    maxlength: 'Máximo 120 caracteres.',
  });

  protected readonly errorEmail = campoError(this.#formUi, this.formulario.controls.email, {
    required: 'El correo es obligatorio.',
    email: 'Ingresá un correo válido.',
    maxlength: 'Máximo 254 caracteres.',
  });

  protected readonly errorAsunto = campoError(this.#formUi, this.formulario.controls.asunto, {
    required: 'El asunto es obligatorio.',
    minlength: 'Mínimo 5 caracteres.',
    maxlength: 'Máximo 160 caracteres.',
  });

  protected readonly errorMensaje = campoError(this.#formUi, this.formulario.controls.mensaje, {
    required: 'El mensaje es obligatorio.',
    minlength: 'Mínimo 10 caracteres.',
  });

  protected enviar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid || this.enviando()) {
      return;
    }

    this.enviando.set(true);
    this.enviado.set(false);
    this.errorEnvio.set(null);

    this.#http
      .crearContacto(this.formulario.getRawValue())
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.enviado.set(true);
          this.formulario.reset();
        },
        error: (error: unknown) => {
          this.enviando.set(false);
          this.errorEnvio.set(mensajeErrorHttp(error, 'No se pudo enviar el mensaje.'));
        },
      });
  }
}
