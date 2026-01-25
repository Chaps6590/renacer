// Mock data removed as requested
import { User, Celula } from '../types';

export const mockUsers: User[] = [];
export const mockLideresDisponibles: User[] = [];
export const mockCelulas: Celula[] = [];

// Función helper simulada (vacía)
export const delay = (ms: number) => Promise.resolve();

// Mock de login (lanza error para forzar uso de API real o no hacer nada)
export const mockLogin = async (email: string, _password: string) => {
  throw new Error('Mock data removed');
};

// Mock de registro
export const mockRegister = async (userData: any) => {
  throw new Error('Mock data removed');
};
