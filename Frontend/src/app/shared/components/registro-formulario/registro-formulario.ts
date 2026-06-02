import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ManoHttpClient } from '@shared/services/mano-http-client';
import { campoError } from '@shared/utils/error-campo';
import { textoOpcionalParaApi } from '@shared/utils/texto-opcional';
import { mensajeErrorHttp } from '@shared/utils/http-error';
import { createFormUiRevision } from '@shared/utils/track-form-ui';
import { MamButton } from '@shared/components/mam-button/mam-button';

function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const texto = String(value);
    const tieneLongitud = texto.length >= 8;
    const tieneMayuscula = /[A-Z]/.test(texto);
    const tieneNumero = /\d/.test(texto);

    if (tieneLongitud && tieneMayuscula && tieneNumero) {
      return null;
    }
    return { passwordStrength: true };
  };
}

const passwordRegistroValidators = [
  Validators.required,
  Validators.maxLength(128),
  passwordStrengthValidator(),
];

export interface RegistroExitosoEvent {
  username: string;
}

@Component({
  selector: 'app-registro-formulario',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MamButton],
  templateUrl: './registro-formulario.html',
})
export class RegistroFormulario {
  readonly #formBuilder = inject(NonNullableFormBuilder);
  readonly #api = inject(ManoHttpClient);
  readonly #destroyRef = inject(DestroyRef);

  readonly compacto = input(false);
  readonly usarMamButton = input(false);
  readonly mensajeExito = input<string | null>(null);

  readonly registroExitoso = output<RegistroExitosoEvent>();

  protected readonly enviando = signal(false);
  protected readonly mensaje = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.#formBuilder.group({
    username: this.#formBuilder.control('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150),
        Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
      ],
    }),
    email: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    password: this.#formBuilder.control('', { validators: passwordRegistroValidators }),
    first_name: this.#formBuilder.control('', { validators: [Validators.maxLength(150)] }),
    last_name: this.#formBuilder.control('', { validators: [Validators.maxLength(150)] }),
  }) satisfies {
    controls: {
      username: FormControl<string>;
      email: FormControl<string>;
      password: FormControl<string>;
      first_name: FormControl<string>;
      last_name: FormControl<string>;
    };
  };

  readonly #formUi = createFormUiRevision(this.form, this.#destroyRef);

  protected readonly errorUsuario = campoError(this.#formUi, this.form.controls.username, {
    required: 'Requerido.',
    minlength: 'Mínimo 3 caracteres.',
    maxlength: 'Máximo 150.',
    pattern: 'Solo letras, números y _ . -',
  });
  protected readonly errorEmail = campoError(this.#formUi, this.form.controls.email, {
    required: 'Requerido.',
    email: 'Formato de email inválido.',
  });
  protected readonly errorPassword = campoError(this.#formUi, this.form.controls.password, {
    required: 'Requerida.',
    passwordStrength: 'Debe tener al menos 8 caracteres, una mayúscula y un número.',
    maxlength: 'Máximo 128 caracteres.',
  });

  protected enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set('Revisá los campos marcados en el formulario.');
      return;
    }

    this.enviando.set(true);
    this.error.set(null);
    this.mensaje.set(null);

    const valores = this.form.getRawValue();
    this.#api
      .createUsuario({
        username: valores.username,
        email: valores.email,
        password: valores.password,
        first_name: textoOpcionalParaApi(valores.first_name),
        last_name: textoOpcionalParaApi(valores.last_name),
      })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.enviando.set(false);
          const textoExito =
            this.mensajeExito() ?? 'Usuario creado. Ahora podés iniciar sesión.';
          this.mensaje.set(textoExito);
          this.registroExitoso.emit({ username: valores.username });
          this.form.reset();
        },
        error: (error: unknown) => {
          this.enviando.set(false);
          this.error.set(mensajeErrorHttp(error, 'No se pudo crear el usuario.'));
        },
      });
  }

}
