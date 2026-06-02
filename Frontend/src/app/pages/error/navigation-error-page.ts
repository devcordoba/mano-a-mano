import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigation-error-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="container py-5 text-center" aria-labelledby="nav-error-title">
      <h1 id="nav-error-title" class="h2 fw-bold mb-3">No se pudo abrir la página</h1>
      <p class="text-muted mb-4">
        Ocurrió un problema al navegar. Probá volver al inicio o al panel de oportunidades.
      </p>
      <nav class="d-flex flex-wrap gap-2 justify-content-center" aria-label="Acciones de recuperación">
        <a routerLink="/inicio" class="btn btn-primary mam-btn-primary">Ir al inicio</a>
        <a routerLink="/panel" class="btn btn-outline-secondary">Ir al panel</a>
      </nav>
    </section>
  `,
})
export class NavigationErrorPage {}
