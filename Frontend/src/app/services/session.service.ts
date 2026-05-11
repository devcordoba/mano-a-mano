import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export type RolSimulado = 'VOL' | 'ORG';

const STORAGE_USER = 'mam_demo_user_id';
const STORAGE_ROL = 'mam_demo_rol';
const STORAGE_TOKEN_KEY = 'mam_auth_token';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly cambio = new Subject<void>();
  readonly cambio$ = this.cambio.asObservable();

  readonly usuarioId = signal<number | null>(null);
  readonly rolActual = signal<RolSimulado>('VOL');

  constructor() {
    if (typeof localStorage === 'undefined') {
      return;
    }
    if (localStorage.getItem(STORAGE_TOKEN_KEY)) {
      return;
    }
    const rawId = localStorage.getItem(STORAGE_USER);
    const rawRol = localStorage.getItem(STORAGE_ROL);
    if (rawId != null) {
      const id = Number(rawId);
      if (Number.isFinite(id)) {
        this.usuarioId.set(id);
      }
    }
    if (rawRol === 'VOL' || rawRol === 'ORG') {
      this.rolActual.set(rawRol);
    } else if (rawRol != null && rawRol !== '') {
      localStorage.setItem(STORAGE_ROL, 'VOL');
      this.rolActual.set('VOL');
    }
  }

  esPanelVoluntario(): boolean {
    return this.rolActual() === 'VOL';
  }

  esPanelOrganizacion(): boolean {
    return this.rolActual() === 'ORG';
  }

  private notificar(): void {
    this.cambio.next();
  }

  setUsuarioId(id: number | null): void {
    this.usuarioId.set(id);
    if (typeof localStorage === 'undefined') {
      this.notificar();
      return;
    }
    if (localStorage.getItem(STORAGE_TOKEN_KEY)) {
      this.notificar();
      return;
    }
    if (id == null) {
      localStorage.removeItem(STORAGE_USER);
    } else {
      localStorage.setItem(STORAGE_USER, String(id));
    }
    this.notificar();
  }

  setRol(r: RolSimulado): void {
    this.rolActual.set(r);
    if (typeof localStorage === 'undefined') {
      this.notificar();
      return;
    }
    if (localStorage.getItem(STORAGE_TOKEN_KEY)) {
      this.notificar();
      return;
    }
    localStorage.setItem(STORAGE_ROL, r);
    this.notificar();
  }
}
