export function normalizarApiUrl(url: string): string {
  if (url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url;
}

export function esPeticionApi(url: string, apiBase: string): boolean {
  const base = apiBase.replace(/\/$/, '');
  if (url.startsWith(base)) {
    return true;
  }
  try {
    const pathname = new URL(url, 'http://localhost').pathname;
    return pathname === base || pathname.startsWith(`${base}/`);
  } catch {
    return url.includes(`${base}/`) || url.endsWith(base);
  }
}
