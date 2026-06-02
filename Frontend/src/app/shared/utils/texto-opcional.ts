export function textoOpcional(valor: string | null | undefined): string {
  if (valor === null || valor === undefined) {
    return '';
  }
  return valor;
}

export function textoOpcionalParaApi(valor: string): string | undefined {
  const texto = valor.trim();
  if (texto === '') {
    return undefined;
  }
  return texto;
}
