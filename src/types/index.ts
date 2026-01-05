export type UserRole = 'pastor' | 'lider' | 'colider';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  celulaId?: string; // Solo para líderes y colíderes
  isRegistered?: boolean; // Para líderes precargados que aún no se registraron
}

export interface Celula {
  id: string;
  name: string;
  liderId: string;
  liderName: string;
  colideres: CoLider[];
  miembros: Miembro[];
  createdAt: Date;
}

export interface CoLider {
  id: string;
  name: string;
  email: string;
  addedAt: Date;
}

export type RolCelula = 'lider' | 'colider' | 'miembro' | 'nuevo';

export interface Miembro {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  rolCelula: RolCelula;
  addedAt: Date;
}

export interface AsistenciaRecord {
  id: string;
  celulaId: string;
  date: Date;
  miembrosPresentes: string[]; // IDs de miembros
  miembrosAusentes: string[]; // IDs de miembros
  totalPresentes: number;
  totalAusentes: number;
  registradoPor: string; // ID del líder o colíder
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
