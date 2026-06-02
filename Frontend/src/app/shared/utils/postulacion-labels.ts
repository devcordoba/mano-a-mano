import type { Mensaje, Postulacion } from '@shared/models/api-types';

export function getEstadoPostulacionLegible(estado: Postulacion['estado']): string {
  switch (estado) {
    case 'PEN':
      return 'Pendiente';
    case 'ACE':
      return 'Aceptada';
    case 'REC':
      return 'Rechazada';
    case 'CAN':
      return 'Cancelada';
    default:
      return estado;
  }
}

export function getTituloOportunidad(postulacion: Postulacion): string {
  if (postulacion.oportunidad_titulo) {
    return postulacion.oportunidad_titulo;
  }
  return `Oportunidad #${postulacion.oportunidad}`;
}

export function getNombreVoluntario(postulacion: Postulacion): string {
  if (postulacion.voluntario_username) {
    return postulacion.voluntario_username;
  }
  return `Usuario ${postulacion.voluntario}`;
}

export function getNombreRemitente(mensaje: Mensaje): string {
  if (mensaje.remitente_username) {
    return mensaje.remitente_username;
  }
  return `Usuario ${mensaje.remitente}`;
}

export function esMensajeSaliente(mensaje: Mensaje, userId: number | null): boolean {
  if (userId === null) {
    return false;
  }
  return mensaje.remitente === userId;
}
