import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, merge, of, Subject, Subscription } from 'rxjs';
import { map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { TIPOS_ACTIVIDAD_VOLUNTARIADO } from '../../shared/constants/tipos-actividad-voluntariado';
import { AuthService } from '../../services/auth.service';
import { ManoApiService } from '../../services/mano-api.service';
import { SessionService } from '../../services/session.service';
import type {
  Mensaje,
  OportunidadVoluntariado,
  Organizacion,
  Postulacion,
  Usuario,
} from '../../models/api.models';

interface BloquePostulaciones {
  titulo: string;
  oportunidadId: number;
  items: Postulacion[];
}

interface MensajePostulacionContexto {
  destinatario: number;
  oportunidadId: number | null;
}

function optionalHttpUrl(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = String(control.value ?? '').trim();
    if (!raw) {
      return null;
    }
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const u = new URL(withScheme);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return { httpUrl: true };
      }
      return null;
    } catch {
      return { httpUrl: true };
    }
  };
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage implements OnInit, OnDestroy, AfterViewInit {
  private loadSub?: Subscription;
  private readonly destroy$ = new Subject<void>();

  protected readonly textoCtaPostularEnFeed = 'Postularme';

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly oportunidadesFeed = signal<OportunidadVoluntariado[]>([]);

  protected readonly misPostulaciones = signal<Postulacion[]>([]);
  protected readonly misOportunidades = signal<OportunidadVoluntariado[]>([]);
  protected readonly postulacionesBloques = signal<BloquePostulaciones[]>([]);
  protected readonly estadoBorradorPostulacion = signal<Record<number, Postulacion['estado']>>({});
  protected readonly bandejaRecibidos = signal<Mensaje[]>([]);
  protected readonly bandejaEnviados = signal<Mensaje[]>([]);
  protected readonly avisoComposeMensajes = signal<string | null>(null);
  protected readonly misOrganizaciones = signal<Organizacion[]>([]);
  protected readonly publicarOrgId = signal<number | null>(null);

  protected readonly usuarios = signal<Usuario[]>([]);

  protected readonly mensajeCtx = signal<MensajePostulacionContexto | null>(null);
  protected readonly conversacionActivaPostulacionId = signal<number | null>(null);

  protected readonly oppEditandoId = signal<number | null>(null);

  protected readonly orgEditandoId = signal<number | null>(null);

  protected readonly orgForm;
  protected readonly oppForm;
  protected readonly contextMsgForm;

  constructor(
    private readonly api: ManoApiService,
    protected readonly session: SessionService,
    protected readonly auth: AuthService,
    private readonly router: Router,
    private readonly fb: NonNullableFormBuilder,
  ) {
    this.orgForm = this.fb.group({
      nombre_publico: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
      }),
      email_contacto: this.fb.control('', {
        validators: [Validators.required, Validators.email, Validators.maxLength(254)],
      }),
      descripcion: this.fb.control('', { validators: [Validators.maxLength(4000)] }),
      telefono: this.fb.control('', { validators: [Validators.maxLength(40)] }),
      sitio_web: this.fb.control('', {
        validators: [Validators.maxLength(200), optionalHttpUrl()],
      }),
    });
    this.oppForm = this.fb.group({
      titulo: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(5), Validators.maxLength(200)],
      }),
      descripcion: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(10), Validators.maxLength(8000)],
      }),
      ubicacion: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
      }),
      causa: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(120)],
      }),
      tipo_actividad: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(120)],
      }),
      disponibilidad: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
      }),
      requisitos: this.fb.control('', { validators: [Validators.maxLength(4000)] }),
      cupos: this.fb.control(1, {
        validators: [Validators.required, Validators.min(1), Validators.max(999)],
      }),
      fecha_actividad: this.fb.control<string>(''),
    });
    this.contextMsgForm = this.fb.group({
      cuerpo: this.fb.control('', {
        validators: [Validators.required, Validators.minLength(5), Validators.maxLength(4000)],
      }),
    });
  }

  protected oportunidadesFeedVisibles(): OportunidadVoluntariado[] {
    const feed = this.oportunidadesFeed();
    const orgIds = new Set(this.misOrganizaciones().map((org) => org.id));
    if (orgIds.size === 0) {
      return feed;
    }
    return feed.filter((o) => !orgIds.has(o.organizacion));
  }

  protected staffUsuarioSelectValue(): string {
    const id = this.session.usuarioId();
    return id == null ? '' : String(id);
  }

  protected publicarOrgSelectValue(): string {
    const id = this.publicarOrgId();
    return id == null ? '' : String(id);
  }

  protected organizacionParaPublicar(): Organizacion | null {
    const id = this.publicarOrgId();
    if (id == null) {
      return null;
    }
    const n = Number(id);
    return this.misOrganizaciones().find((o) => o.id === id || o.id === n) ?? null;
  }

  protected bandejaMensajesThread(): Mensaje[] {
    const ctx = this.mensajeCtx();
    const uid = this.session.usuarioId();
    const rec = this.bandejaRecibidos();
    const env = this.bandejaEnviados();
    if (ctx == null || uid == null) {
      return [];
    }
    const oppId = ctx.oportunidadId;
    const other = ctx.destinatario;
    const map = new Map<number, Mensaje>();
    for (const m of [...rec, ...env]) {
      map.set(m.id, m);
    }
    return [...map.values()]
      .filter((m) => {
        if (oppId != null) {
          if (m.oportunidad == null || m.oportunidad !== oppId) {
            return false;
          }
        }
        const saliente = m.remitente === uid && m.destinatario === other;
        const entrante = m.remitente === other && m.destinatario === uid;
        return saliente || entrante;
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  ngOnInit(): void {
    merge(this.auth.cambio$, this.session.cambio$)
      .pipe(startWith(undefined), takeUntil(this.destroy$))
      .subscribe(() => this.actualizarDatosSegunSesion());
  }

  ngAfterViewInit(): void {
    this.api.listUsuarios().subscribe({
      next: (users) => {
        this.usuarios.set(users);
      },
      error: () => {
        this.error.set(
          'No se pudo contactar al backend. Levantá Django en el puerto 8000, revisá CORS (origen http://localhost:4200 o http://127.0.0.1:4200) y que la URL base de la API sea correcta.',
        );
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loadSub?.unsubscribe();
  }

  private actualizarDatosSegunSesion(): void {
    this.loadSub?.unsubscribe();
    let uid = this.session.usuarioId();
    if (!this.auth.isLoggedIn() && uid != null) {
      this.session.setUsuarioId(null);
      uid = null;
    }
    if (uid == null) {
      this.limpiarDatosPersonales();
      this.cargando.set(true);
      this.error.set(null);
      this.loadSub = this.cargarSoloFeed().subscribe({
        next: () => {
          this.cargando.set(false);
        },
        error: (err: unknown) => {
          this.cargando.set(false);
          const cuerpo = (err as { error?: unknown })?.error;
          this.error.set(
            typeof cuerpo === 'object' && cuerpo !== null
              ? JSON.stringify(cuerpo)
              : 'Error al consultar la API.',
          );
        },
      });
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.loadSub = this.cargar(uid).subscribe({
      next: () => {
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        const cuerpo = (err as { error?: unknown })?.error;
        this.error.set(
          typeof cuerpo === 'object' && cuerpo !== null
            ? JSON.stringify(cuerpo)
            : 'Error al consultar la API.',
        );
      },
    });
  }

  private limpiarDatosPersonales(): void {
    this.misPostulaciones.set([]);
    this.misOportunidades.set([]);
    this.postulacionesBloques.set([]);
    this.estadoBorradorPostulacion.set({});
    this.bandejaRecibidos.set([]);
    this.bandejaEnviados.set([]);
    this.misOrganizaciones.set([]);
    this.publicarOrgId.set(null);
    this.oppEditandoId.set(null);
    this.orgEditandoId.set(null);
    this.mensajeCtx.set(null);
    this.conversacionActivaPostulacionId.set(null);
    this.avisoComposeMensajes.set(null);
  }

  private cargarSoloFeed() {
    return this.api.listOportunidades({ activa: 'true' }).pipe(
      tap((feed) => this.oportunidadesFeed.set(feed)),
      map(() => void 0),
    );
  }

  private cargar(uid: number) {
    return forkJoin({
      feed: this.api.listOportunidades({ activa: 'true' }),
      bandeja: this.api.bandeja(uid),
      orgs: this.api.listOrganizaciones(uid),
      postsVol: this.api.listPostulaciones({ voluntario: uid }),
      users: this.api.listUsuarios(),
    }).pipe(
      tap(({ users }) => this.usuarios.set(users)),
      switchMap(({ feed, bandeja, orgs, postsVol }) => {
        this.oportunidadesFeed.set(feed);
        this.bandejaRecibidos.set(bandeja.recibidos);
        this.bandejaEnviados.set(bandeja.enviados);
        this.misPostulaciones.set(postsVol);
        this.misOrganizaciones.set(orgs);
        const orgIds = orgs.map((o) => o.id);
        const prevPub = this.publicarOrgId();
        if (prevPub == null || !orgIds.includes(prevPub)) {
          this.publicarOrgId.set(orgIds[0] ?? null);
        }
        if (!orgs.length) {
          this.misOportunidades.set([]);
          this.postulacionesBloques.set([]);
          return of(null);
        }
        return forkJoin(orgs.map((o) => this.api.listOportunidades({ organizacion: String(o.id) }))).pipe(
          switchMap((listasPorOrg) => {
            const todas = listasPorOrg.flat();
            this.misOportunidades.set(todas);
            if (!todas.length) {
              this.postulacionesBloques.set([]);
              return of(null);
            }
            return forkJoin(
              todas.map((o) =>
                this.api.listPostulaciones({ oportunidad: o.id }).pipe(
                  map((items) => ({
                    titulo: o.titulo,
                    oportunidadId: o.id,
                    items,
                  })),
                ),
              ),
            ).pipe(tap((bloques: BloquePostulaciones[]) => this.postulacionesBloques.set(bloques)));
          }),
        );
      }),
      map(() => void 0),
    );
  }

  protected estadoPostulacionLegible(estado: Postulacion['estado']): string {
    switch (estado) {
      case 'PEN':
        return 'Pendiente';
      case 'ACE':
        return 'Aceptada';
      case 'REC':
        return 'Rechazada';
      case 'CAN':
        return 'Cancelada';
      default:
        return estado;
    }
  }

  protected yaPostuloEstaOportunidad(oportunidadId: number): boolean {
    return this.misPostulaciones().some((p) => p.oportunidad === oportunidadId);
  }

  protected puedeMostrarPostularme(o: OportunidadVoluntariado): boolean {
    if (!this.auth.isLoggedIn()) {
      return true;
    }
    if (!this.session.esPanelVoluntario() && !this.session.esPanelOrganizacion()) {
      return false;
    }
    return !this.yaPostuloEstaOportunidad(o.id);
  }

  protected esMensajeSaliente(m: Mensaje): boolean {
    const uid = this.session.usuarioId();
    return uid != null && m.remitente === uid;
  }

  protected onPostularmeClick(oportunidadId: number): void {
    if (!this.auth.isLoggedIn()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/panel' } });
      return;
    }
    this.postular(oportunidadId);
  }

  protected puedeGestionarPostulantesEnVistaActual(): boolean {
    return this.misOrganizaciones().length > 0;
  }

  protected estadoSelectPara(p: Postulacion): Postulacion['estado'] {
    const b = this.estadoBorradorPostulacion()[p.id];
    return b ?? p.estado;
  }

  protected muestraBotonEscribirAlPostulante(p: Postulacion): boolean {
    return (
      this.puedeGestionarPostulantesEnVistaActual() &&
      p.estado === 'ACE' &&
      this.estadoSelectPara(p) === 'ACE'
    );
  }

  protected hayCambioEstadoPostulacion(p: Postulacion): boolean {
    return this.estadoSelectPara(p) !== p.estado;
  }

  protected onEstadoBorradorChange(p: Postulacion, nuevo: string): void {
    const next = nuevo as Postulacion['estado'];
    if (next === p.estado) {
      this.estadoBorradorPostulacion.update((m) => {
        const copy = { ...m };
        delete copy[p.id];
        return copy;
      });
    } else {
      this.estadoBorradorPostulacion.update((m) => ({ ...m, [p.id]: next }));
    }
  }

  protected onEstadoSelectNativeChange(p: Postulacion, event: Event): void {
    const el = event.target;
    if (!(el instanceof HTMLSelectElement)) {
      return;
    }
    this.onEstadoBorradorChange(p, el.value);
  }

  protected guardarEstadoPostulacion(p: Postulacion): void {
    const next = this.estadoSelectPara(p);
    if (next === p.estado) {
      return;
    }
    this.api.updatePostulacion(p.id, { estado: next }).subscribe({
      next: () => {
        this.error.set(null);
        this.estadoBorradorPostulacion.update((m) => {
          const copy = { ...m };
          delete copy[p.id];
          return copy;
        });
        this.refrescarManual();
      },
      error: (e: unknown) => {
        this.error.set(JSON.stringify((e as { error?: unknown })?.error ?? e));
        this.refrescarManual();
      },
    });
  }

  protected postular(oportunidadId: number): void {
    const uid = this.session.usuarioId();
    if (uid == null) {
      return;
    }
    this.api
      .createPostulacion({
        voluntario: uid,
        oportunidad: oportunidadId,
        estado: 'PEN',
        comentario: '',
      })
      .subscribe({
        next: () => this.refrescarManual(),
        error: (e: unknown) => {
          const duplicado = DashboardPage.mensajeSiPostulacionDuplicada(e);
          this.error.set(duplicado ?? JSON.stringify((e as { error?: unknown })?.error ?? e));
        },
      });
  }

  private static mensajeSiPostulacionDuplicada(e: unknown): string | null {
    if (!(e instanceof HttpErrorResponse) || e.status !== 400 || e.error == null || typeof e.error !== 'object') {
      return null;
    }
    const raw = e.error as { non_field_errors?: unknown; detail?: unknown };
    const list = raw.non_field_errors;
    if (Array.isArray(list)) {
      for (const msg of list) {
        if (typeof msg !== 'string') {
          continue;
        }
        const lower = msg.toLowerCase();
        if (
          lower.includes('único') ||
          lower.includes('unico') ||
          lower.includes('unique') ||
          lower.includes('conjunto único')
        ) {
          return 'Ya te has postulado a esta propuesta.';
        }
      }
    }
    return null;
  }

  protected guardarOrganizacion(): void {
    this.orgForm.markAllAsTouched();
    if (this.orgForm.invalid) {
      return;
    }
    const uid = this.session.usuarioId();
    if (uid == null) {
      this.error.set(
        'Para crear una organización tenés que iniciar sesión o elegir un usuario de prueba en el selector del panel (arriba).',
      );
      return;
    }
    const v = this.orgForm.getRawValue();
    const sitioTrim = (v.sitio_web ?? '').trim();
    const editId = this.orgEditandoId();
    if (editId != null) {
      this.api
        .updateOrganizacion(editId, {
          nombre_publico: v.nombre_publico,
          email_contacto: v.email_contacto,
          descripcion: v.descripcion ?? '',
          telefono: v.telefono ?? '',
          sitio_web: sitioTrim,
        })
        .subscribe({
          next: () => {
            this.error.set(null);
            this.cancelarEdicionOrganizacion();
            this.refrescarManual();
          },
          error: (e: unknown) => this.error.set(JSON.stringify((e as { error?: unknown })?.error ?? e)),
        });
      return;
    }
    this.api
      .createOrganizacion({
        propietario: uid,
        nombre_publico: v.nombre_publico,
        email_contacto: v.email_contacto,
        descripcion: v.descripcion ?? '',
        telefono: v.telefono ?? '',
        sitio_web: sitioTrim,
      })
      .subscribe({
        next: () => {
          this.error.set(null);
          this.cancelarEdicionOrganizacion();
          this.refrescarManual();
        },
        error: (e: unknown) => this.error.set(JSON.stringify((e as { error?: unknown })?.error ?? e)),
      });
  }

  protected editarOrganizacion(org: Organizacion): void {
    this.orgEditandoId.set(org.id);
    this.orgForm.patchValue({
      nombre_publico: org.nombre_publico,
      email_contacto: org.email_contacto,
      descripcion: org.descripcion ?? '',
      telefono: org.telefono ?? '',
      sitio_web: org.sitio_web ?? '',
    });
  }

  protected nuevaOrganizacion(): void {
    this.cancelarEdicionOrganizacion();
  }

  protected cancelarEdicionOrganizacion(): void {
    this.orgEditandoId.set(null);
    this.orgForm.reset({
      nombre_publico: '',
      email_contacto: '',
      descripcion: '',
      telefono: '',
      sitio_web: '',
    });
  }

  protected eliminarOrganizacion(org: Organizacion): void {
    if (!confirm(`¿Eliminar la organización «${org.nombre_publico}» y sus convocatorias?`)) {
      return;
    }
    this.api.deleteOrganizacion(org.id).subscribe({
      next: () => {
        this.cancelarEdicionOrganizacion();
        this.refrescarManual();
      },
      error: (e: unknown) => this.error.set(JSON.stringify((e as { error?: unknown })?.error ?? e)),
    });
  }

  protected tiposActividadSelectOptions(): string[] {
    const cat = [...TIPOS_ACTIVIDAD_VOLUNTARIADO];
    const v = this.oppForm.get('tipo_actividad')?.value;
    if (typeof v === 'string' && v.trim().length > 0 && !cat.includes(v)) {
      return [v, ...cat];
    }
    return cat;
  }

  protected onStaffUsuarioSelectChange(event: Event): void {
    const el = event.target;
    if (!(el instanceof HTMLSelectElement)) {
      return;
    }
    const raw = el.value;
    if (raw === '') {
      this.session.setUsuarioId(null);
      return;
    }
    const id = Number(raw);
    if (Number.isFinite(id)) {
      this.session.setUsuarioId(id);
    }
  }

  protected onPublicarOrgNativeSelectChange(event: Event): void {
    const el = event.target;
    if (!(el instanceof HTMLSelectElement)) {
      return;
    }
    this.onCambiarOrganizacionPublicar(el.value);
  }

  protected onCambiarOrganizacionPublicar(orgId: number | string | null): void {
    if (orgId == null || orgId === '') {
      return;
    }
    const id = typeof orgId === 'number' ? orgId : Number(orgId);
    if (!Number.isFinite(id)) {
      return;
    }
    this.publicarOrgId.set(id);
    this.cancelarEdicionOportunidad();
  }

  protected irATabMisOrganizaciones(): void {
    const trigger = document.getElementById('dashboard-tab-mis-orgs-trigger');
    const bootstrap = (globalThis as typeof globalThis & { bootstrap?: { Tab: { getOrCreateInstance(el: HTMLElement): { show(): void } } } }).bootstrap;
    if (trigger && bootstrap?.Tab) {
      bootstrap.Tab.getOrCreateInstance(trigger).show();
    }
  }

  private irATabPublicar(): void {
    const trigger = document.getElementById('dashboard-tab-publicar-trigger');
    const bootstrap = (globalThis as typeof globalThis & { bootstrap?: { Tab: { getOrCreateInstance(el: HTMLElement): { show(): void } } } }).bootstrap;
    if (trigger && bootstrap?.Tab) {
      bootstrap.Tab.getOrCreateInstance(trigger).show();
    }
  }

  protected editarOportunidad(o: OportunidadVoluntariado): void {
    this.publicarOrgId.set(o.organizacion);
    this.oppEditandoId.set(o.id);
    const fecha = o.fecha_actividad;
    const fechaInput =
      typeof fecha === 'string' && fecha.length >= 10 ? fecha.slice(0, 10) : fecha ? String(fecha).slice(0, 10) : '';
    this.oppForm.patchValue({
      titulo: o.titulo,
      descripcion: o.descripcion,
      ubicacion: o.ubicacion,
      causa: o.causa,
      tipo_actividad: o.tipo_actividad,
      disponibilidad: o.disponibilidad,
      requisitos: o.requisitos ?? '',
      cupos: o.cupos,
      fecha_actividad: fechaInput,
    });
    this.irATabPublicar();
  }

  protected cancelarEdicionOportunidad(): void {
    this.oppEditandoId.set(null);
    this.oppForm.reset({
      titulo: '',
      descripcion: '',
      ubicacion: '',
      causa: '',
      tipo_actividad: '',
      disponibilidad: '',
      requisitos: '',
      cupos: 1,
      fecha_actividad: '',
    });
  }

  protected guardarOportunidad(): void {
    this.oppForm.markAllAsTouched();
    if (this.oppForm.invalid) {
      this.error.set(
        'Revisá el formulario: descripción mín. 10 caracteres; título mín. 5; completá ubicación, causa, tipo de actividad y disponibilidad.',
      );
      return;
    }
    const org = this.organizacionParaPublicar();
    if (!org) {
      this.error.set('Elegí una organización o creá una ficha en Mis organizaciones.');
      return;
    }
    this.error.set(null);
    const v = this.oppForm.getRawValue();
    const fecha = v.fecha_actividad?.trim();
    const payload = {
      titulo: v.titulo,
      descripcion: v.descripcion,
      ubicacion: v.ubicacion,
      causa: v.causa,
      tipo_actividad: v.tipo_actividad,
      disponibilidad: v.disponibilidad,
      requisitos: v.requisitos ?? '',
      cupos: v.cupos,
      fecha_actividad: fecha ? fecha : null,
    };
    const eid = this.oppEditandoId();
    if (eid != null) {
      this.api
        .updateOportunidad(eid, {
          ...payload,
          organizacion: org.id,
        })
        .subscribe({
          next: () => {
            this.error.set(null);
            this.cancelarEdicionOportunidad();
            this.refrescarManual();
          },
          error: (e: unknown) => this.error.set(JSON.stringify((e as { error?: unknown })?.error ?? e)),
        });
      return;
    }
    this.api
      .createOportunidad({
        organizacion: org.id,
        ...payload,
        activa: true,
      })
      .subscribe({
        next: () => {
          this.error.set(null);
          this.cancelarEdicionOportunidad();
          this.refrescarManual();
        },
        error: (e: unknown) => this.error.set(JSON.stringify((e as { error?: unknown })?.error ?? e)),
      });
  }

  protected abrirMensajeOrganizacionAPostulante(p: Postulacion, oportunidadId: number): void {
    this.abrirThreadOrgVoluntarioInterno(p, oportunidadId, true);
  }

  protected seleccionarThreadMensajesOrg(p: Postulacion): void {
    this.abrirThreadOrgVoluntarioInterno(p, p.oportunidad, false);
  }

  private abrirThreadOrgVoluntarioInterno(
    p: Postulacion,
    oportunidadId: number,
    navegarATabMensajes: boolean,
  ): void {
    this.avisoComposeMensajes.set(null);
    this.conversacionActivaPostulacionId.set(p.id);
    this.mensajeCtx.set({
      destinatario: p.voluntario,
      oportunidadId,
    });
    this.contextMsgForm.reset({ cuerpo: '' });
    if (navegarATabMensajes) {
      this.activarTabMensajesYEnfocar();
    }
  }

  protected abrirMensajeVoluntarioAOrganizacion(p: Postulacion): void {
    this.abrirThreadVoluntarioInterno(p, true);
  }

  protected seleccionarThreadMensajesVol(p: Postulacion): void {
    this.abrirThreadVoluntarioInterno(p, false);
  }

  private abrirThreadVoluntarioInterno(p: Postulacion, navegarATabMensajes: boolean): void {
    if (!this.auth.isLoggedIn() || this.session.usuarioId() == null) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/panel' } });
      return;
    }
    this.api
      .getOportunidad(p.oportunidad)
      .pipe(switchMap((opp) => this.api.getOrganizacion(opp.organizacion)))
      .subscribe({
        next: (org) => {
          this.avisoComposeMensajes.set(null);
          this.conversacionActivaPostulacionId.set(p.id);
          this.mensajeCtx.set({
            destinatario: org.propietario,
            oportunidadId: p.oportunidad,
          });
          this.contextMsgForm.reset({ cuerpo: '' });
          if (navegarATabMensajes) {
            this.activarTabMensajesYEnfocar();
          }
        },
        error: (e: unknown) => this.error.set(JSON.stringify((e as { error?: unknown })?.error ?? e)),
      });
  }

  protected cerrarContextoMensaje(): void {
    this.mensajeCtx.set(null);
    this.conversacionActivaPostulacionId.set(null);
    this.contextMsgForm.reset({ cuerpo: '' });
    this.avisoComposeMensajes.set(null);
  }

  protected enviarMensajeContextual(): void {
    const ctx = this.mensajeCtx();
    const uid = this.session.usuarioId();
    if (ctx == null || uid == null) {
      if (ctx == null) {
        this.avisoComposeMensajes.set('Elegí una conversación de la lista de la izquierda.');
      }
      return;
    }
    this.avisoComposeMensajes.set(null);
    this.contextMsgForm.markAllAsTouched();
    if (this.contextMsgForm.invalid) {
      return;
    }
    const cuerpo = this.contextMsgForm.getRawValue().cuerpo;
    const body: Partial<Mensaje> = {
      remitente: uid,
      destinatario: ctx.destinatario,
      cuerpo,
    };
    if (ctx.oportunidadId != null) {
      body.oportunidad = ctx.oportunidadId;
    }
    this.api.createMensaje(body).subscribe({
      next: () => {
        this.contextMsgForm.reset({ cuerpo: '' });
        this.refrescarManual();
      },
      error: (e: unknown) => this.error.set(JSON.stringify((e as { error?: unknown })?.error ?? e)),
    });
  }

  protected toggleActiva(opp: OportunidadVoluntariado): void {
    this.api.updateOportunidad(opp.id, { activa: !opp.activa }).subscribe({
      next: () => this.refrescarManual(),
      error: (e: unknown) => this.error.set(JSON.stringify((e as { error?: unknown })?.error ?? e)),
    });
  }

  protected eliminarOportunidad(id: number): void {
    if (!confirm('¿Eliminar esta oportunidad?')) {
      return;
    }
    this.api.deleteOportunidad(id).subscribe({
      next: () => this.refrescarManual(),
      error: (e: unknown) => this.error.set(JSON.stringify((e as { error?: unknown })?.error ?? e)),
    });
  }

  private activarTabMensajesYEnfocar(): void {
    const trigger = document.getElementById('dashboard-tab-msg-trigger');
    const bootstrap = (globalThis as typeof globalThis & { bootstrap?: { Tab: { getOrCreateInstance(el: HTMLElement): { show(): void } } } }).bootstrap;
    if (trigger && bootstrap?.Tab) {
      bootstrap.Tab.getOrCreateInstance(trigger).show();
    }
    setTimeout(() => {
      document.getElementById('mam-compose-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 120);
  }

  private refrescarManual(): void {
    const uid = this.session.usuarioId();
    this.cargando.set(true);
    this.error.set(null);
    const sub =
      uid == null
        ? this.cargarSoloFeed()
        : this.cargar(uid);
    sub.subscribe({
      next: () => this.cargando.set(false),
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(JSON.stringify((err as { error?: unknown })?.error ?? err));
      },
    });
  }
}
