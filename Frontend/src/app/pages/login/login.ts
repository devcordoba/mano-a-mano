import { Component, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form;

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      username: this.fb.control('', { validators: [Validators.required, Validators.minLength(2)] }),
      password: this.fb.control('', { validators: [Validators.required, Validators.minLength(1)] }),
    });
  }

  protected enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const { username, password } = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set(null);
    this.auth.login(username, password).subscribe({
      next: () => {
        this.enviando.set(false);
        const raw = this.route.snapshot.queryParamMap.get('returnUrl');
        const target =
          raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/panel';
        void this.router.navigateByUrl(target);
      },
      error: (e: unknown) => {
        this.enviando.set(false);
        const body = (e as { error?: { detail?: string } })?.error;
        this.error.set(typeof body?.detail === 'string' ? body.detail : 'No se pudo iniciar sesión.');
      },
    });
  }
}
