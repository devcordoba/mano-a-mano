import { HttpErrorResponse } from '@angular/common/http';
import {
  esDrfErrorBody,
  esErrorResponse,
  type DrfErrorBody,
} from '@shared/models/error-response';

function mensajeDesdeDrf(body: DrfErrorBody): string | null {
  if (typeof body.detail === 'string' && body.detail.trim()) {
    return body.detail;
  }

  const partes: string[] = [];

  if (Array.isArray(body.non_field_errors)) {
    for (const item of body.non_field_errors) {
      if (typeof item === 'string') {
        partes.push(item);
      }
    }
  }

  for (const [campo, valor] of Object.entries(body)) {
    if (campo === 'detail' || campo === 'non_field_errors') {
      continue;
    }
    if (Array.isArray(valor)) {
      partes.push(`${campo}: ${valor.map(String).join(', ')}`);
    } else if (typeof valor === 'string') {
      partes.push(`${campo}: ${valor}`);
    }
  }

  if (partes.length === 0) {
    return null;
  }
  return partes.join(' · ');
}

export function mensajeErrorHttp(err: unknown, fallback = 'Ocurrió un error.'): string {
  if (!(err instanceof HttpErrorResponse)) {
    return fallback;
  }

  const body = err.error;

  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (esErrorResponse(body)) {
    if (body.message.trim()) {
      return body.message;
    }
    if (body.error.trim()) {
      return body.error;
    }
    return body.code;
  }

  if (esDrfErrorBody(body)) {
    const mensajeDrf = mensajeDesdeDrf(body);
    if (mensajeDrf !== null) {
      return mensajeDrf;
    }
  }

  if (err.status === 401) {
    return 'Credenciales inválidas o sesión expirada.';
  }
  if (err.status === 403) {
    return 'No tenés permiso para realizar esta acción.';
  }
  if (err.status === 404) {
    return 'El recurso solicitado no existe.';
  }

  return fallback;
}

export function mensajeErrorUniqueConstraint(
  error: unknown,
  mensaje: string,
  status = 400,
): string | null {
  if (!(error instanceof HttpErrorResponse) || error.status !== status) {
    return null;
  }
  if (error.error === null || typeof error.error !== 'object') {
    return null;
  }
  const lista = (error.error as DrfErrorBody).non_field_errors;
  if (!Array.isArray(lista)) {
    return null;
  }
  for (const item of lista) {
    if (typeof item !== 'string') {
      continue;
    }
    const texto = item.toLowerCase();
    if (
      texto.includes('único') ||
      texto.includes('unico') ||
      texto.includes('unique') ||
      texto.includes('conjunto único')
    ) {
      return mensaje;
    }
  }
  return null;
}
