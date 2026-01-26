import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';

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
    // Verificar si hay una sesión guardada completa
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    } else if (savedUser || savedToken) {
      // Si solo hay uno de los dos, la sesión está corrupta
      console.warn('[AuthContext] Incomplete session found, clearing...');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Llamada real a la API
      const response: any = await api.login(email, password);

      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role.toLowerCase() as UserRole,
        celulaId: response.user.celulaId,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw new Error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      // Llamada real a la API
      const response: any = await api.register(userData);

      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      const newUser: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role.toLowerCase() as UserRole,
        celulaId: response.user.celulaId,
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
    localStorage.removeItem('token');
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
