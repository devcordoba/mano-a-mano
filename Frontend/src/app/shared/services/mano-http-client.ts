import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiConfig } from '@core/http/api-config';
import type {
  BandejaMensajes,
  CatalogoItem,
  Mensaje,
  MensajeAlta,
  OportunidadDetalle,
  OportunidadListItem,
  OportunidadVoluntariado,
  Organizacion,
  PerfilResponse,
  Postulacion,
  PostulacionBloqueOrganizador,
  UsuarioAlta,
  UsuarioCreado,
} from '@shared/models/api-types';

@Injectable({ providedIn: 'root' })
export class ManoHttpClient {
  readonly #api = inject(ApiConfig);

  createUsuario(body: UsuarioAlta): Observable<UsuarioCreado> {
    return this.#api.http.post<UsuarioCreado>(`${this.#api.apiUrl}/usuarios/`, body);
  }

  listOrganizaciones(propietarioId: number): Observable<Organizacion[]> {
    const params = new HttpParams().set('propietario', String(propietarioId));
    return this.#api.http.get<Organizacion[]>(`${this.#api.apiUrl}/organizaciones/`, { params });
  }

  createOrganizacion(body: Partial<Organizacion>): Observable<Organizacion> {
    return this.#api.http.post<Organizacion>(`${this.#api.apiUrl}/organizaciones/`, body);
  }

  updateOrganizacion(id: number, body: Partial<Organizacion>): Observable<Organizacion> {
    return this.#api.http.patch<Organizacion>(`${this.#api.apiUrl}/organizaciones/${id}/`, body);
  }

  deleteOrganizacion(id: number): Observable<void> {
    return this.#api.http.delete<void>(`${this.#api.apiUrl}/organizaciones/${id}/`);
  }

  listCausas(): Observable<CatalogoItem[]> {
    return this.#api.http.get<CatalogoItem[]>(`${this.#api.apiUrl}/causas/`);
  }

  listTiposActividad(): Observable<CatalogoItem[]> {
    return this.#api.http.get<CatalogoItem[]>(`${this.#api.apiUrl}/tipos-actividad/`);
  }

  listOportunidades(
    filtros?: Partial<{ activa: string; q: string }>,
  ): Observable<OportunidadListItem[]> {
    let params = new HttpParams();
    if (filtros) {
      const entradas: [keyof typeof filtros, string | undefined][] = [
        ['activa', filtros.activa],
        ['q', filtros.q],
      ];
      for (const [clave, valor] of entradas) {
        if (valor !== null && valor !== undefined && valor !== '') {
          params = params.set(clave, valor);
        }
      }
    }
    return this.#api.http.get<OportunidadListItem[]>(
      `${this.#api.apiUrl}/oportunidades/`,
      { params },
    );
  }

  listMisOportunidades(propietarioId: number): Observable<OportunidadVoluntariado[]> {
    const params = new HttpParams().set('propietario', String(propietarioId));
    return this.#api.http.get<OportunidadVoluntariado[]>(
      `${this.#api.apiUrl}/oportunidades/`,
      { params },
    );
  }

  getOportunidad(id: number): Observable<OportunidadDetalle> {
    return this.#api.http.get<OportunidadDetalle>(`${this.#api.apiUrl}/oportunidades/${id}/`);
  }

  getPerfil(): Observable<PerfilResponse> {
    return this.#api.http.get<PerfilResponse>(`${this.#api.apiUrl}/auth/perfil/`);
  }

  createOportunidad(
    body: Partial<OportunidadVoluntariado>,
    imagen?: File | null,
  ): Observable<OportunidadVoluntariado> {
    if (imagen) {
      return this.#api.http.post<OportunidadVoluntariado>(
        `${this.#api.apiUrl}/oportunidades/`,
        this.#buildOportunidadFormData(body, imagen),
      );
    }
    return this.#api.http.post<OportunidadVoluntariado>(`${this.#api.apiUrl}/oportunidades/`, body);
  }

  updateOportunidad(
    id: number,
    body: Partial<OportunidadVoluntariado>,
    imagen?: File | null,
  ): Observable<OportunidadVoluntariado> {
    if (imagen) {
      return this.#api.http.patch<OportunidadVoluntariado>(
        `${this.#api.apiUrl}/oportunidades/${id}/`,
        this.#buildOportunidadFormData(body, imagen),
      );
    }
    return this.#api.http.patch<OportunidadVoluntariado>(
      `${this.#api.apiUrl}/oportunidades/${id}/`,
      body,
    );
  }

  #buildOportunidadFormData(body: Partial<OportunidadVoluntariado>, imagen: File): FormData {
    const formData = new FormData();

    let fechaActividad = '';
    if (body.fecha_actividad !== null && body.fecha_actividad !== undefined) {
      fechaActividad = String(body.fecha_actividad);
    }

    const campos: Record<string, string | number | boolean | null | undefined> = {
      organizacion: body.organizacion,
      titulo: body.titulo,
      descripcion: body.descripcion,
      ubicacion: body.ubicacion,
      causa: body.causa,
      tipo_actividad: body.tipo_actividad,
      disponibilidad: body.disponibilidad,
      requisitos: body.requisitos,
      cupos: body.cupos,
      fecha_actividad: fechaActividad,
      activa: body.activa,
    };

    for (const clave of Object.keys(campos)) {
      const valor = campos[clave];
      if (valor === undefined || valor === null) {
        continue;
      }
      formData.append(clave, String(valor));
    }

    formData.append('imagen', imagen, imagen.name);
    return formData;
  }

  deleteOportunidad(id: number): Observable<void> {
    return this.#api.http.delete<void>(`${this.#api.apiUrl}/oportunidades/${id}/`);
  }

  listPostulacionesVoluntario(voluntarioId: number): Observable<Postulacion[]> {
    const params = new HttpParams().set('voluntario', String(voluntarioId));
    return this.#api.http.get<Postulacion[]>(`${this.#api.apiUrl}/postulaciones/`, { params });
  }

  listPostulacionesBloquesOrganizador(): Observable<PostulacionBloqueOrganizador[]> {
    return this.#api.http
      .get<{ titulo: string; oportunidad_id: number; items: Postulacion[] }[]>(
        `${this.#api.apiUrl}/postulaciones/bloques-organizador/`,
      )
      .pipe(
        map((bloques) =>
          bloques.map((bloque) => ({
            titulo: bloque.titulo,
            oportunidadId: bloque.oportunidad_id,
            items: bloque.items,
          })),
        ),
      );
  }

  createPostulacion(body: { oportunidad: number }): Observable<Postulacion> {
    return this.#api.http.post<Postulacion>(`${this.#api.apiUrl}/postulaciones/`, body);
  }

  updatePostulacion(
    id: number,
    body: Pick<Postulacion, 'estado'>,
  ): Observable<Postulacion> {
    return this.#api.http.patch<Postulacion>(`${this.#api.apiUrl}/postulaciones/${id}/`, body);
  }

  bandeja(usuarioId: number): Observable<BandejaMensajes> {
    const params = new HttpParams().set('usuario', String(usuarioId));
    return this.#api.http.get<BandejaMensajes>(`${this.#api.apiUrl}/mensajes/bandeja/`, { params });
  }

  createMensaje(body: MensajeAlta): Observable<Mensaje> {
    return this.#api.http.post<Mensaje>(`${this.#api.apiUrl}/mensajes/`, body);
  }
}
