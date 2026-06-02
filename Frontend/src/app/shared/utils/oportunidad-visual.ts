import { normalizarApiUrl } from '@core/http/api-url';

export function clasePaletaOportunidad(causaId: number | null | undefined): string {
  if (causaId === null || causaId === undefined) {
    return 'mam-opp-palette-default';
  }
  return `mam-opp-palette-${Math.abs(causaId) % 9}`;
}

export function urlImagenOportunidad(
  apiBase: string,
  oportunidadId: number,
  versionCache?: string | number | null,
): string {
  let url = `${normalizarApiUrl(apiBase)}/oportunidades/${oportunidadId}/imagen/`;
  if (versionCache !== null && versionCache !== undefined && versionCache !== '') {
    url += `?v=${encodeURIComponent(String(versionCache))}`;
  }
  return url;
}
