import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // TODO: Reemplazar con llamada a API real
      // Simulación de login
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock de usuarios según el email
      let mockUser: User;
      
      if (email === 'pastor@renacer.com') {
        mockUser = {
          id: '1',
          name: 'Pastor Principal',
          email: email,
          role: 'pastor',
        };
      } else if (email === 'juan@renacer.com') {
        mockUser = {
          id: '2',
          name: 'Juan Pérez',
          email: email,
          role: 'lider',
          celulaId: '1',
        };
      } else if (email === 'maria@renacer.com') {
        mockUser = {
          id: '3',
          name: 'María González',
          email: email,
          role: 'lider',
          celulaId: '2',
        };
      } else {
        throw new Error('Usuario no encontrado');
      }
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      // TODO: Reemplazar con llamada a API real
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Destructure password to mark it as used (even though we don't use it in mock)
      const { password, ...userDataWithoutPassword } = userData;
      
      const newUser: User = {
        id: Date.now().toString(),
        name: userDataWithoutPassword.name || '',
        email: userDataWithoutPassword.email || '',
        role: userDataWithoutPassword.role || 'lider',
        celulaId: userDataWithoutPassword.celulaId,
        isRegistered: true,
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
