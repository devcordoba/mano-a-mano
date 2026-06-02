export const AUTH_TOKEN_STORAGE_KEY = 'mam_auth_token';

export function leerToken(): string | null {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token === null || token.trim() === '') {
      return null;
    }
    if (!tokenVigente(token)) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function guardarToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function borrarToken(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

function tokenVigente(token: string): boolean {
  try {
    const segmento = token.split('.')[1];
    if (segmento === undefined) {
      return false;
    }
    const payload = JSON.parse(atob(segmento)) as { exp?: number };
    if (typeof payload.exp !== 'number') {
      return true;
    }
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
