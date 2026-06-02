import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardFacade } from '../services/dashboard-facade';
import { OportunidadPanel } from '../services/oportunidad-panel';

@Component({
  selector: 'app-dashboard-publicaciones-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './dashboard-publicaciones-tab.html',
})
export class DashboardPublicacionesTab {
  protected readonly data = inject(DashboardFacade);
  protected readonly oportunidades = inject(OportunidadPanel);
}
