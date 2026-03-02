export type UserRole = 'admin' | 'pastor' | 'supervisor' | 'lider' | 'colider' | 'timoteo';

export type MotivoFalta = 'vacaciones' | 'trabajo' | 'enfermedad' | 'familia' | 'viaje' | 'sin-motivo' | 'otro' | 'dejar-pendiente';

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
  liderEmail?: string;
  liderPhone?: string;
  liderFechaNacimiento?: string; // Fecha de nacimiento del líder principal
  supervisorId?: string; // ID del supervisor asignado
  supervisorName?: string; // Nombre del supervisor
  supervisorEmail?: string; // Email del supervisor
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
  phone?: string;
  fechaNacimiento?: string; // Fecha de nacimiento opcional
  addedAt: Date;
}

export type RolCelula = 'lider' | 'colider' | 'timoteo' | 'miembro' | 'nuevo';

export interface Miembro {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  fechaNacimiento?: string; // Fecha de nacimiento opcional
  direccion?: string; // Dirección opcional
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
  ofrenda: number; // Monto de la ofrenda recaudada (por defecto 0)
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
  subidoPor: { id: string; name: string } | string;
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
export interface PeticionPastor {
  id: string;
  asistenciaId: string;
  celulaId: string;
  celulaNombre: string;
  miembroId: string;
  miembroNombre: string;
  fecha: Date;
  presente: boolean;
  anotacion: string;
  prioridad: PrioridadAnotacion;
  motivoFalta?: MotivoFalta;
  motivoPersonalizado?: string;
  registradoPor: string;
  accionPastoral?: string;
  resuelta: boolean;
  fechaResolucion?: string;
}
