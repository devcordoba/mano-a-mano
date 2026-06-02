import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth';
import { MamCard } from '@shared/components/mam-card/mam-card';
import { RegistroFormulario } from '@shared/components/registro-formulario/registro-formulario';

@Component({
  selector: 'app-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MamCard, RegistroFormulario],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  protected readonly auth = inject(AuthService);
}
