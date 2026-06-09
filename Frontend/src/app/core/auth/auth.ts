import { HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  DOCUMENT,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Observable, of } from 'rxjs';
import { catchError, filter, finalize, map, shareReplay, tap } from 'rxjs/operators';
import type { AuthLoginResponse, AuthMeResponse, AuthUser } from '@shared/models/api-types';
import { ApiConfig } from '@core/http/api-config';
import {
  AUTH_TOKEN_STORAGE_KEY,
  borrarToken,
  guardarToken,
  leerToken,
} from '@core/http/auth-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly #api = inject(ApiConfig);
  readonly #router = inject(Router);
  readonly #document = inject(DOCUMENT);
  readonly #platformId = inject(PLATFORM_ID);

  #reconcileInFlight: Observable<AuthUser | null> | null = null;

  readonly #userSignal = signal<AuthUser | null>(null);
  readonly sesionReconciliada = signal(false);
  readonly sesionEpoch = signal(0);

  readonly isLoggedIn = computed(() => this.#userSignal() !== null);

  readonly userId = computed(() => this.#userSignal()?.id ?? null);

  readonly esVoluntario = computed(() => {
    const usuario = this.#userSignal();
    if (usuario === null) {
      return false;
    }
    if (usuario.perfil === null) {
      return true;
    }
    return usuario.perfil.rol === 'VOL';
  });

  readonly displayLabel = computed(() => {
    const usuario = this.#userSignal();
    if (usuario === null) {
      return '';
    }

    const partesNombre: string[] = [];
    if (usuario.first_name) {
      partesNombre.push(usuario.first_name);
    }
    if (usuario.last_name) {
      partesNombre.push(usuario.last_name);
    }

    const nombreCompleto = partesNombre.join(' ').trim();
    if (nombreCompleto !== '') {
      return nombreCompleto;
    }
    return usuario.username;
  });

  constructor() {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    const ventana = this.#document.defaultView;
    if (ventana === null) {
      return;
    }

    fromEvent<StorageEvent>(ventana, 'storage')
      .pipe(filter((event) => event.key === AUTH_TOKEN_STORAGE_KEY))
      .subscribe(() => {
        void this.reconcileSession();
      });
  }

  reconcileSession(): Observable<AuthUser | null> {
    if (this.#reconcileInFlight === null) {
      this.#reconcileInFlight = this.#fetchMe().pipe(
        finalize(() => {
          this.#reconcileInFlight = null;
        }),
        shareReplay(1),
      );
    }
    return this.#reconcileInFlight;
  }

  login(username: string, password: string): Observable<AuthUser> {
    return this.#api.http
      .post<AuthLoginResponse>(`${this.#api.apiUrl}/auth/login/`, { username, password })
      .pipe(
        tap((respuesta) => {
          this.#reconcileInFlight = null;
          guardarToken(respuesta.token);
          this.#aplicarUsuario(respuesta.user);
          this.sesionEpoch.update((epoch) => epoch + 1);
        }),
        map((respuesta) => respuesta.user),
      );
  }

  clearSessionLocal(): void {
    this.#limpiarSesionLocal();
  }

  logout(): void {
    const destino = this.#router.url.startsWith('/panel') ? '/panel/feed' : '/inicio';
    const token = leerToken();

    if (token === null) {
      this.#limpiarSesionLocal();
      void this.#router.navigateByUrl(destino);
      return;
    }

    this.#api.http
      .post<{ detail: string }>(`${this.#api.apiUrl}/auth/logout/`, {})
      .pipe(
        catchError(() => of(null)),
        finalize(() => {
          this.#limpiarSesionLocal();
          void this.#router.navigateByUrl(destino);
        }),
      )
      .subscribe();
  }

  #fetchMe(): Observable<AuthUser | null> {
    const idAnterior = this.#userSignal()?.id ?? null;
    const token = leerToken();

    if (token === null) {
      this.#userSignal.set(null);
      this.sesionReconciliada.set(true);
      if (idAnterior !== null) {
        this.sesionEpoch.update((epoch) => epoch + 1);
      }
      return of(null);
    }

    return this.#api.http.get<AuthMeResponse>(`${this.#api.apiUrl}/auth/me/`).pipe(
      tap((respuesta) => {
        this.#aplicarUsuario(respuesta.user);
        const idNuevo = respuesta.user?.id ?? null;
        if (idAnterior === null && idNuevo !== null) {
          this.sesionEpoch.update((epoch) => epoch + 1);
        } else if (idAnterior !== null && idNuevo !== null && idAnterior !== idNuevo) {
          this.sesionEpoch.update((epoch) => epoch + 1);
        }
      }),
      map((respuesta) => respuesta.user),
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
          borrarToken();
        }
        this.#userSignal.set(null);
        this.sesionReconciliada.set(true);
        if (idAnterior !== null) {
          this.sesionEpoch.update((epoch) => epoch + 1);
        }
        return of(null);
      }),
    );
  }

  #aplicarUsuario(user: AuthUser | null): void {
    this.#userSignal.set(user);
    this.sesionReconciliada.set(true);
  }

  #limpiarSesionLocal(): void {
    this.#reconcileInFlight = null;
    borrarToken();
    this.#userSignal.set(null);
    this.sesionReconciliada.set(true);
    this.sesionEpoch.update((epoch) => epoch + 1);
  }
}
