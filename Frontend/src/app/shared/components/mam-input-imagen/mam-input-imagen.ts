import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { validarImagenOportunidad } from '@shared/utils/oportunidad-imagen';

@Component({
  selector: 'app-mam-input-imagen',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mam-input-imagen.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MamInputImagen),
      multi: true,
    },
  ],
})
export class MamInputImagen implements ControlValueAccessor {
  readonly inputId = input.required<string>();
  readonly accept = input('.jpg,.jpeg,.png,image/jpeg,image/png');
  readonly ayuda = input('Opcional. Solo JPG, JPEG o PNG. Máx. 5 MB.');

  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly errorValidacion = signal<string | null>(null);
  readonly previewUrlChange = output<string | null>();

  #deshabilitado = false;
  #previewBlobUrl: string | null = null;
  #onChange: (valor: File | null) => void = () => {};
  #onTouched: () => void = () => {};

  writeValue(valor: File | null): void {
    if (valor === null) {
      this.limpiarInputNativo();
    }
  }

  registerOnChange(fn: (valor: File | null) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.#deshabilitado = deshabilitado;
  }

  onArchivoSeleccionado(event: Event): void {
    this.#onTouched();
    if (this.#deshabilitado) {
      return;
    }

    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    if (!input.files || input.files.length === 0) {
      return;
    }

    const archivo = input.files[0];
    if (!archivo) {
      return;
    }

    const error = validarImagenOportunidad(archivo);
    if (error !== null) {
      this.errorValidacion.set(error);
      input.value = '';
      return;
    }

    this.errorValidacion.set(null);
    this.#onChange(archivo);
    this.#emitirPreview(URL.createObjectURL(archivo));
  }

  limpiarInputNativo(): void {
    const input = this.fileInput()?.nativeElement;
    if (input !== undefined) {
      input.value = '';
    }
    this.#revocarPreview();
    this.previewUrlChange.emit(null);
  }

  #emitirPreview(url: string): void {
    this.#revocarPreview();
    this.#previewBlobUrl = url;
    this.previewUrlChange.emit(url);
  }

  #revocarPreview(): void {
    if (this.#previewBlobUrl !== null) {
      URL.revokeObjectURL(this.#previewBlobUrl);
      this.#previewBlobUrl = null;
    }
  }
}
