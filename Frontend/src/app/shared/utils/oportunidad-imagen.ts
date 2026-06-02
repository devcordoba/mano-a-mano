const EXTENSIONES_PERMITIDAS = new Set(['jpg', 'jpeg', 'png']);
const TIPOS_MIME_PERMITIDOS = new Set(['image/jpeg', 'image/png']);

const MENSAJE_EXTENSION_INVALIDA =
  'Extensión no válida. Solo se aceptan archivos JPG, JPEG y PNG.';

export function validarImagenOportunidad(archivo: File): string | null {
  const punto = archivo.name.lastIndexOf('.');
  const extension = punto < 0 ? '' : archivo.name.slice(punto + 1).toLowerCase();
  if (!EXTENSIONES_PERMITIDAS.has(extension)) {
    return MENSAJE_EXTENSION_INVALIDA;
  }

  if (archivo.type && !TIPOS_MIME_PERMITIDOS.has(archivo.type)) {
    return MENSAJE_EXTENSION_INVALIDA;
  }

  if (archivo.size > 5 * 1024 * 1024) {
    return 'La imagen no puede superar 5 MB.';
  }

  return null;
}
