import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

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

  const clearSession = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const normalizeUser = (rawUser: any): User => ({
    ...rawUser,
    role: String(rawUser.role || '').toLowerCase() as UserRole,
  });

  useEffect(() => {
    // Verificar si hay una sesión guardada completa
    const refreshUser = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (savedUser && savedToken) {
        try {
          const normalizedUser = normalizeUser(JSON.parse(savedUser));
          setUser(normalizedUser);

          // Revalidar con backend para detectar token vencido o cambios de rol
          try {
            const me: any = await api.getMe();
            const refreshedUser: User = normalizeUser({
              ...normalizedUser,
              id: me.id,
              name: me.name,
              email: me.email,
              role: me.role,
            });
            setUser(refreshedUser);
            localStorage.setItem('user', JSON.stringify(refreshedUser));
          } catch (error) {
            console.warn('[AuthContext] Session validation failed, clearing session...');
            clearSession();
          }
        } catch (error) {
          console.warn('[AuthContext] Invalid saved user, clearing session...');
          clearSession();
        }
      } else if (savedUser || savedToken) {
        // Si solo hay uno de los dos, la sesión está corrupta
        console.warn('[AuthContext] Incomplete session found, clearing...');
        clearSession();
      }

      setIsLoading(false);
    };

    const handleForcedLogout = () => {
      clearSession();
    };

    refreshUser();
    window.addEventListener('storage', refreshUser);
    window.addEventListener('renacer:force-logout', handleForcedLogout as EventListener);
    return () => {
      window.removeEventListener('storage', refreshUser);
      window.removeEventListener('renacer:force-logout', handleForcedLogout as EventListener);
    };
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
    } catch (error: any) {
      throw new Error(error?.message || 'Error al iniciar sesión');
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
    } catch (error: any) {
      throw new Error(error?.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
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
