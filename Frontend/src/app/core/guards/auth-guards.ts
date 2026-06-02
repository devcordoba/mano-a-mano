import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth';

const RUTA_FEED_PANEL = 'feed';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.sesionReconciliada()) {
    return true;
  }
  if (!auth.isLoggedIn()) {
    return true;
  }

  const router = inject(Router);
  return router.createUrlTree(['/panel', RUTA_FEED_PANEL]);
};

export const dashboardAuthChildGuard: CanActivateChildFn = (childRoute) => {
  const segmento = childRoute.routeConfig?.path;
  if (segmento === undefined || segmento === '' || segmento === RUTA_FEED_PANEL) {
    return true;
  }

  const auth = inject(AuthService);
  if (!auth.sesionReconciliada()) {
    return true;
  }
  if (auth.isLoggedIn()) {
    return true;
  }

  const router = inject(Router);
  return router.createUrlTree(['/panel', RUTA_FEED_PANEL]);
};
