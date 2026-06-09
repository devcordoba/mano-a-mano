export type PerfilRol = 'VOL' | 'ORG';

export interface PerfilUsuario {
  rol: PerfilRol;
}

export interface AuthUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  perfil: PerfilUsuario | null;
}

export interface AuthLoginResponse {
  user: AuthUser;
  token: string;
}

export interface AuthMeResponse {
  user: AuthUser;
}

export interface UsuarioAlta {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

/** Respuesta 201 de POST /api/usuarios/ (sin password). */
export interface UsuarioCreado {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Organizacion {
  id: number;
  nombre_publico: string;
  descripcion: string;
  email_contacto: string;
  telefono: string;
  sitio_web: string;
}

export interface CatalogoItem {
  id: number;
  nombre: string;
}

export interface OrganizacionMini {
  id: number;
  nombre: string;
}

/** Listado resumido — GET /api/oportunidades/?activa=true */
export interface OportunidadListItem {
  id: number;
  titulo: string;
  ubicacion: string;
  organizacion: OrganizacionMini;
  causa: CatalogoItem;
  tipo_actividad: CatalogoItem;
  disponibilidad: string;
  cupos: number;
  fecha_actividad: string | null;
  activa: boolean;
  imagen_url: string | null;
  resumen: string;
}

/** Detalle completo — GET /api/oportunidades/{id}/ */
export interface OportunidadDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  disponibilidad: string;
  requisitos: string;
  cupos: number;
  fecha_actividad: string | null;
  activa: boolean;
  causa: CatalogoItem;
  tipo_actividad: CatalogoItem;
  organizacion: Organizacion;
  imagen_url: string | null;
  updated_at: string;
}

export interface PerfilUsuarioDetalle {
  rol: PerfilRol;
  telefono: string;
  intereses_causas: string;
  disponibilidad_resumen: string;
}

/** Perfil extendido — GET /api/auth/perfil/ */
export interface PerfilUsuarioCompleto {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  perfil: PerfilUsuarioDetalle | null;
  organizacion: Organizacion | null;
}

export interface PerfilResponse {
  user: PerfilUsuarioCompleto;
}

/** CRUD / publicaciones del organizador (listado con ?propietario=) */
export interface OportunidadVoluntariado {
  id: number;
  organizacion: number;
  organizacion_nombre?: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  causa: number;
  tipo_actividad: number;
  tipo_actividad_nombre?: string;
  disponibilidad: string;
  requisitos: string;
  cupos: number;
  fecha_actividad: string | null;
  activa: boolean;
  tiene_imagen?: boolean;
  updated_at: string;
}

export interface PostulacionBloqueOrganizador {
  titulo: string;
  oportunidadId: number;
  items: Postulacion[];
}

export interface Postulacion {
  id: number;
  voluntario: number;
  voluntario_username?: string;
  oportunidad: number;
  oportunidad_titulo?: string;
  organizacion_propietario?: number;
  estado: 'PEN' | 'ACE' | 'REC' | 'CAN';
  created_at: string;
}

export interface Mensaje {
  id: number;
  remitente: number;
  remitente_username?: string;
  destinatario: number;
  destinatario_username?: string;
  oportunidad: number | null;
  cuerpo: string;
  created_at: string;
}

export interface MensajeAlta {
  destinatario: number;
  cuerpo: string;
  oportunidad?: number;
}

export interface BandejaMensajes {
  recibidos: Mensaje[];
  enviados: Mensaje[];
}
