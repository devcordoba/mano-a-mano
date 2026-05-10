export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UsuarioAlta {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface PerfilUsuario {
  id: number;
  user: number;
  username?: string;
  rol: 'VOL' | 'ORG';
  telefono: string;
  intereses_causas: string;
  disponibilidad_resumen: string;
  created_at: string;
  updated_at: string;
}

export interface Organizacion {
  id: number;
  propietario: number;
  propietario_username?: string;
  nombre_publico: string;
  descripcion: string;
  email_contacto: string;
  telefono: string;
  sitio_web: string;
  created_at: string;
  updated_at: string;
}

export interface OportunidadVoluntariado {
  id: number;
  organizacion: number;
  organizacion_nombre?: string;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  causa: string;
  tipo_actividad: string;
  disponibilidad: string;
  requisitos: string;
  cupos: number;
  fecha_actividad: string | null;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Postulacion {
  id: number;
  voluntario: number;
  voluntario_username?: string;
  oportunidad: number;
  oportunidad_titulo?: string;
  estado: 'PEN' | 'ACE' | 'REC' | 'CAN';
  comentario: string;
  created_at: string;
  updated_at: string;
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

export interface BandejaMensajes {
  recibidos: Mensaje[];
  enviados: Mensaje[];
}
