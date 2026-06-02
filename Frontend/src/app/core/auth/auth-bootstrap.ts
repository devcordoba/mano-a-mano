import { inject, provideAppInitializer } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth';

function bootstrapAuthSession(): Promise<void> {
  const auth = inject(AuthService);
  return firstValueFrom(auth.reconcileSession()).then(() => undefined);
}

export const provideAuthBootstrap = () => provideAppInitializer(bootstrapAuthSession);
