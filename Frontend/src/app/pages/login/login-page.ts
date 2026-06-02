import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth';
import { MamButton } from '@shared/components/mam-button/mam-button';
import { MamCard } from '@shared/components/mam-card/mam-card';
import {
  RegistroFormulario,
  type RegistroExitosoEvent,
} from '@shared/components/registro-formulario/registro-formulario';
import { campoError } from '@shared/utils/error-campo';
import { mensajeErrorHttp } from '@shared/utils/http-error';
import { createFormUiRevision } from '@shared/utils/track-form-ui';

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MamCard,
    MamButton,
    RegistroFormulario,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  readonly #formBuilder = inject(NonNullableFormBuilder);
  protected readonly auth = inject(AuthService);
  readonly returnUrl = input<string | undefined>();
  readonly sesion = input<string | undefined>();
  readonly #router = inject(Router);
  readonly #destroyRef = inject(DestroyRef);

  protected readonly sesionExpirada = computed(() => this.sesion() === 'expirada');
  protected readonly enviandoLogin = signal(false);
  protected readonly errorLogin = signal<string | null>(null);

  protected readonly formularioLogin = this.#formBuilder.group({
    username: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(2)],
    }),
    password: this.#formBuilder.control('', {
      validators: [Validators.required, Validators.minLength(1)],
    }),
  }) satisfies {
    controls: {
      username: FormControl<string>;
      password: FormControl<string>;
    };
  };

  readonly #formUi = createFormUiRevision(this.formularioLogin, this.#destroyRef);

  protected readonly errorUsuario = campoError(this.#formUi, this.formularioLogin.controls.username, {
    required: 'El usuario es obligatorio.',
    minlength: 'Mínimo 2 caracteres.',
    maxlength: 'Máximo 150 caracteres.',
  });

  protected readonly errorPassword = campoError(this.#formUi, this.formularioLogin.controls.password, {
    required: 'La contraseña es obligatoria.',
    maxlength: 'Máximo 128 caracteres.',
  });

  protected enviar(): void {
    this.formularioLogin.markAllAsTouched();
    if (this.formularioLogin.invalid) {
      return;
    }

    const credenciales = this.formularioLogin.getRawValue();
    this.enviandoLogin.set(true);
    this.errorLogin.set(null);

    this.auth
      .login(credenciales.username, credenciales.password)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          this.enviandoLogin.set(false);
          const destino = this.#obtenerUrlRetorno();
          void this.#router.navigateByUrl(destino, { replaceUrl: true });
        },
        error: (error: unknown) => {
          this.enviandoLogin.set(false);
          this.errorLogin.set(mensajeErrorHttp(error, 'No se pudo iniciar sesión.'));
        },
      });
  }

  #obtenerUrlRetorno(): string {
    const urlRetorno = this.returnUrl();
    if (urlRetorno === undefined || urlRetorno === '') {
      return '/panel/feed';
    }
    if (!urlRetorno.startsWith('/')) {
      return '/panel/feed';
    }
    if (urlRetorno.startsWith('//')) {
      return '/panel/feed';
    }
    return urlRetorno;
  }

  protected onRegistroExitoso(evento: RegistroExitosoEvent): void {
    this.formularioLogin.patchValue({ username: evento.username });
  }
}
