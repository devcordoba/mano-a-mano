import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/tokens/api-base-url.token';
import type {
  BandejaMensajes,
  Mensaje,
  OportunidadVoluntariado,
  Organizacion,
  PerfilUsuario,
  Postulacion,
  Usuario,
  UsuarioAlta,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ManoApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly base: string,
  ) {}

  health(): Observable<{ status: string; service?: string }> {
    return this.http.get<{ status: string; service?: string }>(`${this.base}/health/`);
  }

  listUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.base}/usuarios/`);
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/usuarios/${id}/`);
  }

  createUsuario(body: UsuarioAlta): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.base}/usuarios/`, body);
  }

  updateUsuario(
    id: number,
    body: Partial<Pick<Usuario, 'username' | 'email' | 'first_name' | 'last_name'>> & {
      password?: string;
    },
  ): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.base}/usuarios/${id}/`, body);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/usuarios/${id}/`);
  }

  listPerfiles(userId?: number): Observable<PerfilUsuario[]> {
    let params = new HttpParams();
    if (userId != null) {
      params = params.set('user', String(userId));
    }
    return this.http.get<PerfilUsuario[]>(`${this.base}/perfiles/`, { params });
  }

  getPerfil(id: number): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${this.base}/perfiles/${id}/`);
  }

  createPerfil(body: Partial<PerfilUsuario>): Observable<PerfilUsuario> {
    return this.http.post<PerfilUsuario>(`${this.base}/perfiles/`, body);
  }

  updatePerfil(id: number, body: Partial<PerfilUsuario>): Observable<PerfilUsuario> {
    return this.http.patch<PerfilUsuario>(`${this.base}/perfiles/${id}/`, body);
  }

  deletePerfil(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/perfiles/${id}/`);
  }

  listOrganizaciones(propietarioId?: number): Observable<Organizacion[]> {
    let params = new HttpParams();
    if (propietarioId != null) {
      params = params.set('propietario', String(propietarioId));
    }
    return this.http.get<Organizacion[]>(`${this.base}/organizaciones/`, { params });
  }

  createOrganizacion(body: Partial<Organizacion>): Observable<Organizacion> {
    return this.http.post<Organizacion>(`${this.base}/organizaciones/`, body);
  }

  updateOrganizacion(id: number, body: Partial<Organizacion>): Observable<Organizacion> {
    return this.http.patch<Organizacion>(`${this.base}/organizaciones/${id}/`, body);
  }

  deleteOrganizacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/organizaciones/${id}/`);
  }

  getOrganizacion(id: number): Observable<Organizacion> {
    return this.http.get<Organizacion>(`${this.base}/organizaciones/${id}/`);
  }

  listOportunidades(filters?: Record<string, string | undefined>): Observable<OportunidadVoluntariado[]> {
    let params = new HttpParams();
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v != null && v !== '') {
          params = params.set(k, v);
        }
      }
    }
    return this.http.get<OportunidadVoluntariado[]>(`${this.base}/oportunidades/`, { params });
  }

  getOportunidad(id: number): Observable<OportunidadVoluntariado> {
    return this.http.get<OportunidadVoluntariado>(`${this.base}/oportunidades/${id}/`);
  }

  createOportunidad(body: Partial<OportunidadVoluntariado>): Observable<OportunidadVoluntariado> {
    return this.http.post<OportunidadVoluntariado>(`${this.base}/oportunidades/`, body);
  }

  updateOportunidad(id: number, body: Partial<OportunidadVoluntariado>): Observable<OportunidadVoluntariado> {
    return this.http.patch<OportunidadVoluntariado>(`${this.base}/oportunidades/${id}/`, body);
  }

  deleteOportunidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/oportunidades/${id}/`);
  }

  listPostulaciones(filters?: { oportunidad?: number; voluntario?: number }): Observable<Postulacion[]> {
    let params = new HttpParams();
    if (filters?.oportunidad != null) {
      params = params.set('oportunidad', String(filters.oportunidad));
    }
    if (filters?.voluntario != null) {
      params = params.set('voluntario', String(filters.voluntario));
    }
    return this.http.get<Postulacion[]>(`${this.base}/postulaciones/`, { params });
  }

  getPostulacion(id: number): Observable<Postulacion> {
    return this.http.get<Postulacion>(`${this.base}/postulaciones/${id}/`);
  }

  createPostulacion(body: Partial<Postulacion>): Observable<Postulacion> {
    return this.http.post<Postulacion>(`${this.base}/postulaciones/`, body);
  }

  updatePostulacion(id: number, body: Partial<Postulacion>): Observable<Postulacion> {
    return this.http.patch<Postulacion>(`${this.base}/postulaciones/${id}/`, body);
  }

  deletePostulacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/postulaciones/${id}/`);
  }

  listMensajes(filters?: { remitente?: number; destinatario?: number }): Observable<Mensaje[]> {
    let params = new HttpParams();
    if (filters?.remitente != null) {
      params = params.set('remitente', String(filters.remitente));
    }
    if (filters?.destinatario != null) {
      params = params.set('destinatario', String(filters.destinatario));
    }
    return this.http.get<Mensaje[]>(`${this.base}/mensajes/`, { params });
  }

  bandeja(usuarioId: number): Observable<BandejaMensajes> {
    const params = new HttpParams().set('usuario', String(usuarioId));
    return this.http.get<BandejaMensajes>(`${this.base}/mensajes/bandeja/`, { params });
  }

  getMensaje(id: number): Observable<Mensaje> {
    return this.http.get<Mensaje>(`${this.base}/mensajes/${id}/`);
  }

  createMensaje(body: Partial<Mensaje>): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.base}/mensajes/`, body);
  }

  updateMensaje(id: number, body: Partial<Mensaje>): Observable<Mensaje> {
    return this.http.patch<Mensaje>(`${this.base}/mensajes/${id}/`, body);
  }

  deleteMensaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/mensajes/${id}/`);
  }
}
