import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '@core/auth/auth';
import { DashboardFacade } from '../services/dashboard-facade';

export const panelDataResolver: ResolveFn<boolean> = () => {
  const auth = inject(AuthService);
  const facade = inject(DashboardFacade);
  const router = inject(Router);

  if (!auth.sesionReconciliada()) {
    return of(true);
  }

  facade.cargarCatalogos();
  return facade.cargarParaUsuarioAsync(auth.userId()).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.clearSessionLocal();
        return of(new RedirectCommand(router.parseUrl('/login')));
      }
      return of(true);
    }),
  );
};
