import { Component, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ManoApiService } from '../../services/mano-api.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage {
  protected readonly enviando = signal(false);
  protected readonly mensaje = signal<string | null>(null);
  protected readonly errorApi = signal<string | null>(null);

  protected readonly registroForm;

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly api: ManoApiService,
    protected readonly auth: AuthService,
  ) {
    this.registroForm = this.fb.group({
      username: this.fb.control('', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(150),
          Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
        ],
      }),
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email, Validators.maxLength(254)],
      }),
      password: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(8), Validators.maxLength(128)],
      }),
      first_name: this.fb.control('', { validators: [Validators.maxLength(150)] }),
      last_name: this.fb.control('', { validators: [Validators.maxLength(150)] }),
    });
  }

  protected enviarRegistro(): void {
    this.registroForm.markAllAsTouched();
    if (this.registroForm.invalid) {
      this.errorApi.set('Revisá los campos marcados en el formulario.');
      return;
    }
    this.enviando.set(true);
    this.errorApi.set(null);
    this.mensaje.set(null);
    const v = this.registroForm.getRawValue();
    this.api
      .createUsuario({
        username: v.username,
        email: v.email,
        password: v.password,
        first_name: v.first_name || undefined,
        last_name: v.last_name || undefined,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.mensaje.set(
            'Usuario creado. Ahora podés iniciar sesión.',
          );
          this.registroForm.reset();
        },
        error: (err) => {
          this.enviando.set(false);
          const det = err?.error;
          const txt =
            typeof det === 'object' && det !== null
              ? JSON.stringify(det)
              : 'No se pudo crear el usuario.';
          this.errorApi.set(txt);
        },
      });
  }
}
