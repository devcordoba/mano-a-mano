import type { Postulacion } from '@shared/models/api-types';

export function propietarioOrganizacionDePostulacion(postulacion: Postulacion): number | null {
  const id = postulacion.organizacion_propietario;
  if (id === null || id === undefined) {
    return null;
  }
  return id;
}
