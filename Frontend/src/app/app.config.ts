import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  RedirectCommand,
  Router,
  provideRouter,
  withComponentInputBinding,
  withNavigationErrorHandler,
} from '@angular/router';
import { authTokenInterceptor } from './core/interceptors/auth-token-interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error-interceptor';
import { provideAuthBootstrap } from './core/auth/auth-bootstrap';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([authTokenInterceptor, httpErrorInterceptor])),
    provideAuthBootstrap(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withNavigationErrorHandler(() => {
        const router = inject(Router);
        return new RedirectCommand(router.parseUrl('/error-navegacion'));
      }),
    ),
  ],
};
