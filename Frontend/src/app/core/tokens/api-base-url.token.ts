import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    const w = globalThis as unknown as { __API_BASE_URL__?: string };
    if (typeof w.__API_BASE_URL__ === 'string' && w.__API_BASE_URL__.length > 0) {
      return w.__API_BASE_URL__.replace(/\/$/, '');
    }
    return 'http://127.0.0.1:8000/api';
  },
});
