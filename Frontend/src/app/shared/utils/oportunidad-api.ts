import type {
  CatalogoItem,
  OportunidadListItem,
  OportunidadVoluntariado,
} from '@shared/models/api-types';

export type OportunidadFeedItem = OportunidadListItem | OportunidadVoluntariado;

export function idCatalogoOportunidad(valor: number | CatalogoItem): number {
  return typeof valor === 'number' ? valor : valor.id;
}

export function idOrganizacionOportunidad(oportunidad: OportunidadFeedItem): number {
  if (typeof oportunidad.organizacion === 'object') {
    return oportunidad.organizacion.id;
  }
  return oportunidad.organizacion;
}

export function nombreOrganizacionOportunidad(oportunidad: OportunidadFeedItem): string {
  if (typeof oportunidad.organizacion === 'object') {
    return oportunidad.organizacion.nombre;
  }
  if ('organizacion_nombre' in oportunidad) {
    return oportunidad.organizacion_nombre ?? 'Organización';
  }
  return 'Organización';
}

export function nombreTipoActividadOportunidad(oportunidad: OportunidadFeedItem): string {
  if (typeof oportunidad.tipo_actividad === 'object') {
    return oportunidad.tipo_actividad.nombre;
  }
  if ('tipo_actividad_nombre' in oportunidad) {
    return oportunidad.tipo_actividad_nombre ?? 'Actividad';
  }
  return 'Actividad';
}

export function imagenUrlOportunidad(oportunidad: OportunidadFeedItem): string | null {
  if ('imagen_url' in oportunidad && oportunidad.imagen_url) {
    return oportunidad.imagen_url;
  }
  return null;
}

export function resumenOportunidad(oportunidad: OportunidadFeedItem): string {
  if ('resumen' in oportunidad) {
    return oportunidad.resumen;
  }
  return oportunidad.descripcion;
}
