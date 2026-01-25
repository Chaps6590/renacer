export type UserRole = 'admin' | 'pastor' | 'lider' | 'colider';

export type MotivoFalta = 'vacaciones' | 'trabajo' | 'enfermedad' | 'familia' | 'viaje' | 'sin-motivo' | 'otro';

export type PrioridadAnotacion = 'alta' | 'media' | 'baja';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  celulaId?: string; // Solo para líderes y colíderes
  fechaNacimiento?: string; // Fecha de nacimiento opcional
  isRegistered?: boolean; // Para líderes precargados que aún no se registraron
  createdAt?: string; // Fecha de creación del usuario
}

export interface Celula {
  id: string;
  name: string;
  liderId: string;
  liderName: string;
  diaSemana: string;
  horario: string;
  coLideres: CoLider[];
  miembros: Miembro[];
  createdAt: Date;
}

export interface CoLider {
  id: string;
  name: string;
  email: string;
  addedAt: Date;
}

export type RolCelula = 'lider' | 'colider' | 'timoteo' | 'miembro' | 'nuevo';

export interface Miembro {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  fechaNacimiento?: string; // Fecha de nacimiento opcional
  rolCelula: RolCelula;
  addedAt: Date;
  isBautizado: boolean;
  tieneDiscipulado: boolean;
  isRegistered: boolean; // Identifica si el miembro está registrado
}

export interface MiembroAsistencia {
  miembroId: string;
  presente: boolean;
  motivoFalta?: MotivoFalta;
  motivoPersonalizado?: string; // Para cuando motivoFalta es 'otro'
  anotacionEspecial?: string; // Para presentes: oración, necesidades, etc.
  prioridadAnotacion?: PrioridadAnotacion;
  motivoCompletado?: boolean; // Si ya se completó el motivo de la falta
  // Acciones pastorales
  accionPastoral?: string;
  resuelta?: boolean;
  fechaResolucion?: string;
  resueltaPorId?: string;
}

export interface AsistenciaRecord {
  id: string;
  celulaId: string;
  date: Date;
  miembros: MiembroAsistencia[];
  totalPresentes: number;
  totalAusentes: number;
  pendientesCompletar: number; // Cantidad de ausentes sin motivo completado
  registradoPor: string; // ID del líder o colíder
  fechaRegistro: Date;
  completado: boolean; // Si todos los motivos de faltas están completados
}

export interface Estadistica {
  celulaId: string;
  celulaNombre: string;
  totalMiembros: number;
  asistenciaSemanal: number[];
  asistenciaMensual: number[];
  asistenciaAnual: number[];
  promedioAsistencia: number;
}

export interface Noticia {
  id: string;
  titulo: string;
  contenido: string;
  imageUrl?: string;
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  importante: boolean;
  creadoPor: string; // ID del pastor/admin
  visible: boolean;
}

export interface MaterialCelula {
  id: string;
  titulo: string;
  descripcion?: string;
  archivoUrl: string;
  nombreArchivo: string;
  fechaSubida: Date;
  subidoPor: string; // ID del pastor/admin
  fechaParaUsar?: Date;
  activo: boolean;
}

export interface ConfiguracionDonaciones {
  aliasIglesia: string;
  cbu?: string;
  descripcion: string;
  activo: boolean;
  fechaActualizacion: Date;
  actualizadoPor: string;
}

export interface PendienteAsistencia {
  asistenciaId: string;
  celulaId: string;
  celulaNombre: string;
  fecha: Date;
  miembrosPendientes: Array<{
    miembroId: string;
    miembroNombre: string;
  }>;
  cantidadPendientes: number;
}
