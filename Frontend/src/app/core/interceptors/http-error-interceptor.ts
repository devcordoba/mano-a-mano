import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/auth/auth';
import { leerToken } from '@core/http/auth-token';
import { esPeticionApi } from '@core/http/api-url';
import { environment } from '@env/environment';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = environment.apiUrl.replace(/\/$/, '');
  if (!esPeticionApi(req.url, apiBase)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/logout') &&
        !req.url.includes('/auth/me') &&
        auth.isLoggedIn() &&
        leerToken() !== null
      ) {
        auth.clearSessionLocal();
        router.navigate(['/login'], {
          queryParams: { returnUrl: '/panel/feed', sesion: 'expirada' },
        });
      }
      return throwError(() => err);
    }),
  );
};
