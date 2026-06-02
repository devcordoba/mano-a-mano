import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { campoError } from '@shared/utils/error-campo';
import { createFormUiRevision } from '@shared/utils/track-form-ui';
import { DashboardFacade } from '../services/dashboard-facade';
import { OrganizacionPanel } from '../services/organizacion-panel';

@Component({
  selector: 'app-dashboard-organizaciones-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard-organizaciones-tab.html',
})
export class DashboardOrganizacionesTab {
  protected readonly data = inject(DashboardFacade);
  protected readonly organizaciones = inject(OrganizacionPanel);
  readonly #destroyRef = inject(DestroyRef);
  readonly #formUi = createFormUiRevision(
    this.organizaciones.organizacionForm,
    this.#destroyRef,
  );
  readonly #form = this.organizaciones.organizacionForm.controls;

  protected readonly errorNombrePublico = campoError(this.#formUi, this.#form.nombre_publico, {
    required: 'El nombre público es obligatorio.',
    minlength: 'Entre 3 y 200 caracteres.',
    maxlength: 'Máximo 200 caracteres.',
  });
  protected readonly errorEmailContacto = campoError(this.#formUi, this.#form.email_contacto, {
    required: 'El email de contacto es obligatorio.',
    email: 'Introducí un email válido (ej: contacto@miorganizacion.org).',
    maxlength: 'Máximo 254 caracteres.',
  });
  protected readonly errorDescripcion = campoError(this.#formUi, this.#form.descripcion, {
    maxlength: 'Máximo 4000 caracteres.',
  });
  protected readonly errorSitioWeb = campoError(this.#formUi, this.#form.sitio_web, {
    httpUrl: 'Introducí una URL válida (con o sin https://).',
  });
}
