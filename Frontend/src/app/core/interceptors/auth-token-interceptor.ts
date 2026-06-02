import { HttpInterceptorFn } from '@angular/common/http';
import { leerToken } from '@core/http/auth-token';
import { esPeticionApi } from '@core/http/api-url';
import { environment } from '@env/environment';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const apiBase = environment.apiUrl.replace(/\/$/, '');
  if (!esPeticionApi(req.url, apiBase)) {
    return next(req);
  }

  const token = leerToken();
  if (token === null) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
