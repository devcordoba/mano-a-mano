import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { FormularioContacto } from '@shared/models/api-types';
import { ManoHttpClient } from '@shared/services/mano-http-client';
import { mensajeErrorHttp } from '@shared/utils/http-error';

@Component({
  selector: 'app-dashboard-consultas-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './dashboard-consultas-tab.html',
  styleUrl: './dashboard-consultas-tab.css',
})
export class DashboardConsultasTab {
  readonly #http = inject(ManoHttpClient);
  readonly #destroyRef = inject(DestroyRef);

  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly consultas = signal<FormularioContacto[]>([]);

  constructor() {
    this.#http
      .listarContactos()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (items) => {
          this.consultas.set(items);
          this.cargando.set(false);
        },
        error: (err: unknown) => {
          this.error.set(mensajeErrorHttp(err, 'No se pudieron cargar las consultas.'));
          this.cargando.set(false);
        },
      });
  }
}
