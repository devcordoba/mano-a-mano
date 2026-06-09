import { computed, Injectable, inject, signal, type Signal } from '@angular/core';
import { forkJoin, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { AuthService } from '@core/auth/auth';
import { ManoHttpClient } from '@shared/services/mano-http-client';
import { mensajeErrorHttp } from '@shared/utils/http-error';
import type {
  CatalogoItem,
  Mensaje,
  OportunidadListItem,
  OportunidadVoluntariado,
  Organizacion,
  Postulacion,
  PostulacionBloqueOrganizador,
} from '@shared/models/api-types';
import {
  idCatalogoOportunidad,
  idOrganizacionOportunidad,
  nombreOrganizacionOportunidad,
  nombreTipoActividadOportunidad,
  resumenOportunidad,
} from '@shared/utils/oportunidad-api';

@Injectable()
export class DashboardFacade {
  readonly #api = inject(ManoHttpClient);
  readonly #auth = inject(AuthService);
  #cargaActiva: Subscription | null = null;
  #catalogosSub: Subscription | null = null;
  #cargaGeneracion = 0;
  #idSesionCargada: number | null | undefined = undefined;

  readonly #busquedaFeed = signal('');
  readonly #filtroCausa = signal<number | null>(null);
  readonly #filtroTipoActividad = signal<number | null>(null);
  readonly #causasCatalogo = signal<CatalogoItem[]>([]);
  readonly #tiposActividadCatalogo = signal<CatalogoItem[]>([]);
  readonly #cargando = signal(false);
  readonly #error = signal<string | null>(null);
  readonly #oportunidadesFeed = signal<OportunidadListItem[]>([]);
  readonly #misPostulaciones = signal<Postulacion[]>([]);
  readonly #misOportunidades = signal<OportunidadVoluntariado[]>([]);
  readonly #postulacionesBloques = signal<PostulacionBloqueOrganizador[]>([]);
  readonly #bandejaRecibidos = signal<Mensaje[]>([]);
  readonly #bandejaEnviados = signal<Mensaje[]>([]);
  readonly #misOrganizaciones = signal<Organizacion[]>([]);
  readonly #idOrganizacionPublicar = signal<number | null>(null);

  readonly busquedaFeed: Signal<string> = this.#busquedaFeed.asReadonly();
  readonly filtroCausa: Signal<number | null> = this.#filtroCausa.asReadonly();
  readonly filtroTipoActividad: Signal<number | null> = this.#filtroTipoActividad.asReadonly();
  readonly causasCatalogo: Signal<CatalogoItem[]> = this.#causasCatalogo.asReadonly();
  readonly tiposActividadCatalogo: Signal<CatalogoItem[]> = this.#tiposActividadCatalogo.asReadonly();
  readonly cargando: Signal<boolean> = this.#cargando.asReadonly();
  readonly error: Signal<string | null> = this.#error.asReadonly();
  readonly oportunidadesFeed: Signal<OportunidadListItem[]> = this.#oportunidadesFeed.asReadonly();
  readonly misPostulaciones: Signal<Postulacion[]> = this.#misPostulaciones.asReadonly();
  readonly misOportunidades: Signal<OportunidadVoluntariado[]> = this.#misOportunidades.asReadonly();
  readonly postulacionesBloques: Signal<PostulacionBloqueOrganizador[]> =
    this.#postulacionesBloques.asReadonly();
  readonly bandejaRecibidos: Signal<Mensaje[]> = this.#bandejaRecibidos.asReadonly();
  readonly bandejaEnviados: Signal<Mensaje[]> = this.#bandejaEnviados.asReadonly();
  readonly misOrganizaciones: Signal<Organizacion[]> = this.#misOrganizaciones.asReadonly();
  readonly idOrganizacionPublicar: Signal<number | null> = this.#idOrganizacionPublicar.asReadonly();

  readonly oportunidadesFeedVisibles = computed((): OportunidadListItem[] => {
    let feed = this.#oportunidadesFeed();
    const idsMisOrganizaciones = new Set(
      this.#misOrganizaciones().map((organizacion) => organizacion.id),
    );
    if (idsMisOrganizaciones.size > 0) {
      feed = feed.filter(
        (oportunidad) => !idsMisOrganizaciones.has(idOrganizacionOportunidad(oportunidad)),
      );
    }

    const causaId = this.#filtroCausa();
    if (causaId !== null) {
      feed = feed.filter(
        (oportunidad) => idCatalogoOportunidad(oportunidad.causa) === causaId,
      );
    }

    const tipoId = this.#filtroTipoActividad();
    if (tipoId !== null) {
      feed = feed.filter(
        (oportunidad) => idCatalogoOportunidad(oportunidad.tipo_actividad) === tipoId,
      );
    }

    const textoBusqueda = this.#busquedaFeed().trim();
    if (textoBusqueda === '') {
      return feed;
    }

    return feed.filter((oportunidad) => this.#matcheaBusquedaFeed(oportunidad, textoBusqueda));
  });

  setBusquedaFeed(valor: string): void {
    this.#busquedaFeed.set(valor);
  }

  setFiltroCausa(id: number | null): void {
    this.#filtroCausa.set(id);
  }

  setFiltroTipoActividad(id: number | null): void {
    this.#filtroTipoActividad.set(id);
  }

  limpiarFiltrosFeed(): void {
    this.#filtroCausa.set(null);
    this.#filtroTipoActividad.set(null);
    this.#busquedaFeed.set('');
  }

  reportarError(mensaje: string | null): void {
    this.#error.set(mensaje);
  }

  limpiarError(): void {
    this.#error.set(null);
  }

  setIdOrganizacionPublicar(id: number | null): void {
    this.#idOrganizacionPublicar.set(id);
  }

  cargarCatalogos(): void {
    this.#catalogosSub?.unsubscribe();
    this.#catalogosSub = forkJoin({
      causas: this.#api.listCausas(),
      tipos: this.#api.listTiposActividad(),
    }).subscribe({
      next: ({ causas, tipos }) => {
        this.#causasCatalogo.set(causas);
        this.#tiposActividadCatalogo.set(tipos);
      },
      error: () => {
        this.#error.set('No se pudo contactar al backend. Verificá que la API esté disponible.');
      },
    });
  }

  cargarParaUsuario(idUsuario: number | null): void {
    this.#cancelarCargaActiva();
    this.#cargaActiva = this.#iniciarCarga(idUsuario)
      .pipe(catchError(() => of(undefined)))
      .subscribe();
  }

  cargarParaUsuarioAsync(idUsuario: number | null): Observable<boolean> {
    this.#cancelarCargaActiva();
    return new Observable<boolean>((subscriber) => {
      const sub = this.#iniciarCarga(idUsuario)
        .pipe(map(() => true))
        .subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      this.#cargaActiva = sub;
      return () => {
        sub.unsubscribe();
        if (this.#cargaActiva === sub) {
          this.#cargaActiva = null;
        }
      };
    });
  }

  recargarSegunSesion(): void {
    const idUsuario = this.#auth.isLoggedIn() ? this.#auth.userId() : null;
    this.cargarParaUsuario(idUsuario);
  }

  reiniciarDatosSesion(): void {
    this.#cancelarCargaActiva();
    this.#idSesionCargada = undefined;
    this.#limpiarTodo();
  }

  sesionYaCargada(idUsuario: number | null): boolean {
    return this.#idSesionCargada === idUsuario;
  }

  registrarPostulacionVoluntario(postulacion: Postulacion): void {
    const actuales = this.#misPostulaciones();
    if (actuales.some((item) => item.oportunidad === postulacion.oportunidad)) {
      return;
    }
    this.#misPostulaciones.set([postulacion, ...actuales]);
  }

  reemplazarPostulacion(actualizada: Postulacion): void {
    const parchear = (lista: Postulacion[]): Postulacion[] => {
      const indice = lista.findIndex((item) => item.id === actualizada.id);
      if (indice === -1) {
        return lista;
      }
      const copia = lista.slice();
      copia[indice] = { ...lista[indice], ...actualizada };
      return copia;
    };

    this.#misPostulaciones.set(parchear(this.#misPostulaciones()));

    const bloquesParcheados = this.#postulacionesBloques().map((bloque) => ({
      ...bloque,
      items: parchear(bloque.items),
    }));
    this.#postulacionesBloques.set(bloquesParcheados);
  }

  registrarMensajeEnviado(mensaje: Mensaje): void {
    const enviados = this.#bandejaEnviados();
    if (enviados.some((item) => item.id === mensaje.id)) {
      return;
    }
    this.#bandejaEnviados.set([mensaje, ...enviados]);
  }

  upsertOrganizacion(organizacion: Organizacion): void {
    const lista = this.#misOrganizaciones();
    const indice = lista.findIndex((item) => item.id === organizacion.id);
    if (indice === -1) {
      this.#misOrganizaciones.set([organizacion, ...lista]);
      if (this.#idOrganizacionPublicar() === null) {
        this.#idOrganizacionPublicar.set(organizacion.id);
      }
      return;
    }
    const copia = lista.slice();
    copia[indice] = organizacion;
    this.#misOrganizaciones.set(copia);
  }

  quitarOrganizacion(id: number): void {
    this.#misOrganizaciones.set(this.#misOrganizaciones().filter((item) => item.id !== id));
    const idPublicar = this.#idOrganizacionPublicar();
    if (idPublicar === id) {
      const restantes = this.#misOrganizaciones();
      this.#idOrganizacionPublicar.set(restantes[0]?.id ?? null);
    }
  }

  upsertOportunidad(actualizada: OportunidadVoluntariado): void {
    const upsertEn = (lista: OportunidadVoluntariado[]): OportunidadVoluntariado[] => {
      const indice = lista.findIndex((item) => item.id === actualizada.id);
      if (indice === -1) {
        return [actualizada, ...lista];
      }
      const copia = lista.slice();
      copia[indice] = { ...lista[indice], ...actualizada };
      return copia;
    };

    this.#misOportunidades.set(upsertEn(this.#misOportunidades()));
  }

  quitarOportunidad(id: number): void {
    this.#misOportunidades.set(this.#misOportunidades().filter((item) => item.id !== id));
    this.#oportunidadesFeed.set(this.#oportunidadesFeed().filter((item) => item.id !== id));
  }

  dispose(): void {
    this.#cancelarCargaActiva();
    this.#catalogosSub?.unsubscribe();
    this.#catalogosSub = null;
  }

  #cancelarCargaActiva(): void {
    this.#cargaActiva?.unsubscribe();
    this.#cargaActiva = null;
    this.#cargaGeneracion += 1;
    this.#cargando.set(false);
  }

  #iniciarCarga(idUsuario: number | null): Observable<void> {
    const generacion = ++this.#cargaGeneracion;
    this.#limpiarTodo();
    this.#cargando.set(true);
    this.#error.set(null);
    const carga = idUsuario === null ? this.#cargarSoloFeed() : this.#cargar(idUsuario);
    return carga.pipe(
      tap(() => {
        if (this.#cargaGeneracion !== generacion) {
          return;
        }
        this.#idSesionCargada = idUsuario;
      }),
      finalize(() => {
        if (this.#cargaGeneracion !== generacion) {
          return;
        }
        this.#cargando.set(false);
        this.#cargaActiva = null;
      }),
      catchError((error: unknown) => {
        this.#error.set(mensajeErrorHttp(error, 'Error al consultar la API.'));
        return throwError(() => error);
      }),
    );
  }

  #limpiarTodo(): void {
    this.#busquedaFeed.set('');
    this.#error.set(null);
    this.#oportunidadesFeed.set([]);
    this.#misPostulaciones.set([]);
    this.#misOportunidades.set([]);
    this.#postulacionesBloques.set([]);
    this.#bandejaRecibidos.set([]);
    this.#bandejaEnviados.set([]);
    this.#misOrganizaciones.set([]);
    this.#idOrganizacionPublicar.set(null);
  }

  #matcheaBusquedaFeed(oportunidad: OportunidadListItem, texto: string): boolean {
    const termino = texto.toLowerCase();
    const campos = [
      oportunidad.titulo,
      resumenOportunidad(oportunidad),
      oportunidad.ubicacion,
      nombreOrganizacionOportunidad(oportunidad),
      nombreTipoActividadOportunidad(oportunidad),
      oportunidad.disponibilidad,
    ];
    return campos.some(
      (campo) => campo !== null && campo !== undefined && campo.toLowerCase().includes(termino),
    );
  }

  #filtrosFeed(): Partial<{ activa: string; q: string }> {
    const filters: Partial<{ activa: string; q: string }> = { activa: 'true' };
    const textoBusqueda = this.#busquedaFeed().trim();
    if (textoBusqueda !== '') {
      filters['q'] = textoBusqueda;
    }
    return filters;
  }

  #cargarSoloFeed(): Observable<void> {
    return this.#api.listOportunidades(this.#filtrosFeed()).pipe(
      tap((feed) => this.#oportunidadesFeed.set(feed)),
      map(() => undefined),
    );
  }

  #cargar(idUsuario: number): Observable<void> {
    const esVoluntario = this.#auth.esVoluntario();

    return forkJoin({
      feed: this.#api.listOportunidades(this.#filtrosFeed()),
      bandeja: this.#api.bandeja(idUsuario),
      organizaciones: this.#api.listOrganizaciones(idUsuario),
      postulacionesVoluntario: esVoluntario
        ? this.#api.listPostulacionesVoluntario(idUsuario)
        : of<Postulacion[]>([]),
      misOportunidades: this.#api.listMisOportunidades(idUsuario),
      postulacionesBloques: this.#api.listPostulacionesBloquesOrganizador(),
    }).pipe(
      tap(
        ({
          feed: oportunidadesFeed,
          bandeja: bandejaMensajes,
          organizaciones,
          postulacionesVoluntario,
          misOportunidades,
          postulacionesBloques,
        }) => {
          this.#oportunidadesFeed.set(oportunidadesFeed);
          this.#bandejaRecibidos.set(bandejaMensajes.recibidos);
          this.#bandejaEnviados.set(bandejaMensajes.enviados);
          this.#misPostulaciones.set(postulacionesVoluntario);
          this.#misOrganizaciones.set(organizaciones);
          this.#misOportunidades.set(misOportunidades);
          this.#postulacionesBloques.set(postulacionesBloques);

          const idsOrganizaciones = organizaciones.map((organizacion) => organizacion.id);
          const idAnterior = this.#idOrganizacionPublicar();
          if (idAnterior === null || !idsOrganizaciones.includes(idAnterior)) {
            this.#idOrganizacionPublicar.set(idsOrganizaciones[0] ?? null);
          }
        },
      ),
      map(() => undefined),
    );
  }
}
