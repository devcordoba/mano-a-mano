export interface ErrorResponse {
  code: string;
  error: string;
  message: string;
}

export interface DrfErrorBody {
  detail?: string;
  non_field_errors?: string[];
  [campo: string]: unknown;
}

export type ApiErrorBody = ErrorResponse | DrfErrorBody | string;

export function esErrorResponse(body: unknown): body is ErrorResponse {
  if (body === null || typeof body !== 'object') {
    return false;
  }
  const registro = body as Record<string, unknown>;
  return (
    typeof registro['code'] === 'string' &&
    typeof registro['error'] === 'string' &&
    typeof registro['message'] === 'string'
  );
}

export function esDrfErrorBody(body: unknown): body is DrfErrorBody {
  return body !== null && typeof body === 'object' && !esErrorResponse(body);
}
