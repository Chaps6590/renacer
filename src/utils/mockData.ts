// Mock data para desarrollo - Reemplazar con llamadas a API

import { User, Celula } from '../types';

// Usuarios de prueba
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Pastor Principal',
    email: 'pastor@renacer.com',
    role: 'pastor',
  },
  {
    id: '2',
    name: 'Juan Pérez',
    email: 'juan@renacer.com',
    role: 'lider',
    celulaId: '1',
    isRegistered: true,
  },
  {
    id: '3',
    name: 'María González',
    email: 'maria@renacer.com',
    role: 'lider',
    celulaId: '2',
    isRegistered: false,
  },
];

// Células de prueba
export const mockCelulas: Celula[] = [
  {
    id: '1',
    name: 'Célula Jóvenes',
    liderId: '2',
    liderName: 'Juan Pérez',
    colideres: [
      {
        id: 'c1',
        name: 'Ana López',
        email: 'ana@example.com',
        addedAt: new Date('2024-01-15'),
      },
    ],
    miembros: [
      {
        id: 'm1',
        name: 'María García',
        phone: '123456789',
        email: 'maria@example.com',
        addedAt: new Date('2024-01-10'),
      },
      {
        id: 'm2',
        name: 'Pedro López',
        phone: '987654321',
        email: 'pedro@example.com',
        addedAt: new Date('2024-01-12'),
      },
      {
        id: 'm3',
        name: 'Laura Martínez',
        phone: '456789123',
        email: 'laura@example.com',
        addedAt: new Date('2024-01-20'),
      },
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Célula Familias',
    liderId: '3',
    liderName: 'María González',
    colideres: [],
    miembros: [
      {
        id: 'm4',
        name: 'Carlos Rodríguez',
        phone: '789456123',
        email: 'carlos@example.com',
        addedAt: new Date('2024-02-01'),
      },
      {
        id: 'm5',
        name: 'Sofía Fernández',
        phone: '321654987',
        email: 'sofia@example.com',
        addedAt: new Date('2024-02-05'),
      },
    ],
    createdAt: new Date('2024-02-01'),
  },
];

// Función helper para simular delay de API
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock de login
export const mockLogin = async (email: string, password: string) => {
  await delay(500);
  
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  // En producción, verificar password hasheado
  return {
    user,
    token: 'mock-jwt-token-' + user.id,
  };
};

// Mock de registro
export const mockRegister = async (userData: Partial<User> & { password: string }) => {
  await delay(500);
  
  const newUser: User = {
    id: Date.now().toString(),
    name: userData.name || '',
    email: userData.email || '',
    role: userData.role || 'lider',
    celulaId: userData.celulaId,
    isRegistered: true,
  };
  
  mockUsers.push(newUser);
  
  return {
    user: newUser,
    token: 'mock-jwt-token-' + newUser.id,
  };
};
