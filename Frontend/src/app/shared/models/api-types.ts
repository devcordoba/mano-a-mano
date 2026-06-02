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
