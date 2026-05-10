import { HttpClient } from '@angular/common/http';
import { computed, Inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, EMPTY, Subject, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_BASE_URL } from '../core/tokens/api-base-url.token';
import { SessionService } from './session.service';

const STORAGE_TOKEN = 'mam_auth_token';
const STORAGE_DEMO_USER = 'mam_demo_user_id';
const STORAGE_DEMO_ROL = 'mam_demo_rol';

export interface AuthUserPayload {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  perfil: { id: number; rol: string } | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUserPayload;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly cambio = new Subject<void>();
  readonly cambio$ = this.cambio.asObservable();

  private readonly tokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<AuthUserPayload | null>(null);

  readonly token = this.tokenSignal.asReadonly();

  readonly isLoggedIn = computed(() => {
    const t = this.tokenSignal();
    return t != null && t !== '';
  });

  readonly isStaff = computed(() => this.userSignal()?.is_staff === true);

  readonly displayLabel = computed(() => {
    const u = this.userSignal();
    if (!u) {
      return '';
    }
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
    return name || u.username;
  });

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly base: string,
    private readonly session: SessionService,
    private readonly router: Router,
  ) {
    this.hydrateFromStorage();
  }

  private notificarCambio(): void {
    this.cambio.next();
  }

  private hydrateFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const t = localStorage.getItem(STORAGE_TOKEN);
    if (!t) {
      return;
    }
    this.tokenSignal.set(t);
    this.notificarCambio();
    this.refreshMe().subscribe({
      error: () => this.clearClientSession(),
    });
  }

  refreshMe(): Observable<AuthUserPayload | null> {
    return this.http.get<{ user: AuthUserPayload }>(`${this.base}/auth/me/`).pipe(
      map(({ user }) => {
        this.userSignal.set(user);
        this.applyUserToSession(user);
        this.notificarCambio();
        return user;
      }),
      catchError(() => {
        this.clearClientSession();
        return EMPTY;
      }),
    );
  }

  private applyUserToSession(user: AuthUserPayload): void {
    this.session.setUsuarioId(user.id);
    const r = user.perfil?.rol;
    if (r === 'ORG') {
      this.session.setRol('ORG');
    } else {
      this.session.setRol('VOL');
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login/`, { username, password }).pipe(
      tap((res) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_TOKEN, res.token);
        }
        this.tokenSignal.set(res.token);
        this.userSignal.set(res.user);
        this.applyUserToSession(res.user);
        this.notificarCambio();
      }),
    );
  }

  logout(): void {
    const t = this.tokenSignal();
    const done = () => {
      this.clearClientSession();
      void this.router.navigateByUrl('/inicio');
    };
    if (t) {
      this.http.post(`${this.base}/auth/logout/`, {}).subscribe({
        next: () => done(),
        error: () => done(),
      });
    } else {
      done();
    }
  }

  private clearClientSession(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_DEMO_USER);
      localStorage.removeItem(STORAGE_DEMO_ROL);
    }
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.session.setUsuarioId(null);
    this.session.setRol('VOL');
    this.notificarCambio();
  }
}
