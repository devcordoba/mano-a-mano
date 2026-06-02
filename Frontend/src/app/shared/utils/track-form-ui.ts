import { DestroyRef, inject, signal, type Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { AbstractControl } from '@angular/forms';
import { FormArray, FormGroup } from '@angular/forms';
import { merge } from 'rxjs';
import { startWith } from 'rxjs/operators';

function recolectarControles(control: AbstractControl): AbstractControl[] {
  if (control instanceof FormGroup) {
    const hijos: AbstractControl[] = [];
    for (const clave of Object.keys(control.controls)) {
      const hijo = control.controls[clave];
      if (hijo !== undefined) {
        hijos.push(...recolectarControles(hijo));
      }
    }
    return [control, ...hijos];
  }
  if (control instanceof FormArray) {
    const hijos: AbstractControl[] = [];
    for (const hijo of control.controls) {
      hijos.push(...recolectarControles(hijo));
    }
    return [control, ...hijos];
  }
  return [control];
}

export function createFormUiRevision(
  control: AbstractControl,
  destroyRef: DestroyRef = inject(DestroyRef),
): Signal<number> {
  const revision = signal(0);

  const fuentes = recolectarControles(control).map((ctrl) => ctrl.events);

  merge(...fuentes)
    .pipe(startWith(null), takeUntilDestroyed(destroyRef))
    .subscribe(() => {
      revision.update((valor) => valor + 1);
    });

  return revision.asReadonly();
}
