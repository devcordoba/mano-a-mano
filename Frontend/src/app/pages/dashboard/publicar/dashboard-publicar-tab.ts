import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MamInputImagen } from '@shared/components/mam-input-imagen/mam-input-imagen';
import { campoError } from '@shared/utils/error-campo';
import { clasePaletaOportunidad } from '@shared/utils/oportunidad-visual';
import { createFormUiRevision } from '@shared/utils/track-form-ui';
import { DashboardFacade } from '../services/dashboard-facade';
import { OportunidadPanel } from '../services/oportunidad-panel';

@Component({
  selector: 'app-dashboard-publicar-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, MamInputImagen],
  templateUrl: './dashboard-publicar-tab.html',
})
export class DashboardPublicarTab {
  protected readonly data = inject(DashboardFacade);
  protected readonly oportunidades = inject(OportunidadPanel);
  readonly #destroyRef = inject(DestroyRef);
  readonly #formUi = createFormUiRevision(this.oportunidades.oportunidadForm, this.#destroyRef);
  readonly #form = this.oportunidades.oportunidadForm.controls;

  protected readonly errorTitulo = campoError(this.#formUi, this.#form.titulo, {
    required: 'Entre 5 y 200 caracteres.',
    minlength: 'Entre 5 y 200 caracteres.',
    maxlength: 'Entre 5 y 200 caracteres.',
  });
  protected readonly errorDescripcion = campoError(this.#formUi, this.#form.descripcion, {
    required: 'Al menos 10 caracteres.',
    minlength: 'Al menos 10 caracteres.',
    maxlength: 'Máximo 8000 caracteres.',
  });
  protected readonly errorUbicacion = campoError(this.#formUi, this.#form.ubicacion, {
    required: 'Entre 3 y 200 caracteres.',
    minlength: 'Entre 3 y 200 caracteres.',
    maxlength: 'Entre 3 y 200 caracteres.',
  });
  protected readonly errorCausa = campoError(this.#formUi, this.#form.causa, {
    required: 'Elegí una causa del listado.',
  });
  protected readonly errorTipoActividad = campoError(this.#formUi, this.#form.tipo_actividad, {
    required: 'Elegí un tipo de actividad.',
  });
  protected readonly errorDisponibilidad = campoError(this.#formUi, this.#form.disponibilidad, {
    required: 'Entre 3 y 200 caracteres.',
    minlength: 'Entre 3 y 200 caracteres.',
    maxlength: 'Entre 3 y 200 caracteres.',
  });
  protected readonly errorCupos = campoError(this.#formUi, this.#form.cupos, {
    required: 'Entre 1 y 999.',
    min: 'Entre 1 y 999.',
    max: 'Entre 1 y 999.',
  });
  protected readonly claseVistaPrevia = computed(() => {
    this.#formUi();
    return clasePaletaOportunidad(this.#form.causa.value);
  });
}
