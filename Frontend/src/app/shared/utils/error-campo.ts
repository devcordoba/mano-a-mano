import { computed, type Signal } from '@angular/core';
import type { AbstractControl } from '@angular/forms';

export function campoError(
  formUi: Signal<number>,
  control: AbstractControl,
  messages: Record<string, string>,
) {
  return computed(() => {
    formUi();
    return errorCampo(control, messages);
  });
}

export function errorCampo(control: AbstractControl, messages: Record<string, string>): string | null {
  if (!control.touched || control.errors === null) {
    return null;
  }
  const orden = [
    'required',
    'email',
    'minlength',
    'maxlength',
    'min',
    'max',
    'pattern',
    'httpUrl',
    'passwordStrength',
  ];
  for (const clave of orden) {
    if (control.errors[clave] !== undefined && control.errors[clave] !== null && messages[clave]) {
      return messages[clave];
    }
  }
  return null;
}
