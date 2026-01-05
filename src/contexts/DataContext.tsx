import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Celula, Miembro, CoLider, AsistenciaRecord } from '../types';

interface DataContextType {
  celulas: Celula[];
  asistencias: AsistenciaRecord[];
  addCelula: (celula: Celula) => void;
  updateCelula: (id: string, celula: Partial<Celula>) => void;
  deleteCelula: (id: string) => void;
  addMiembroToCelula: (celulaId: string, miembro: Miembro) => void;
  removeMiembroFromCelula: (celulaId: string, miembroId: string) => void;
  addColiderToCelula: (celulaId: string, colider: CoLider) => void;
  removeColiderFromCelula: (celulaId: string, coliderId: string) => void;
  updateMiembroRol: (celulaId: string, miembroId: string, nuevoRol: 'miembro' | 'colider' | 'nuevo') => void;
  registrarAsistencia: (asistencia: AsistenciaRecord) => void;
  getCelulaById: (id: string) => Celula | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // TODO: Esto será reemplazado por llamadas a API
  const [celulas, setCelulas] = useState<Celula[]>([
    {
      id: '1',
      name: 'Célula Jóvenes',
      liderId: '2',
      liderName: 'Juan Pérez',
      colideres: [],
      miembros: [
        { id: 'm1', name: 'María García', phone: '123456789', email: 'maria@example.com', rolCelula: 'miembro', addedAt: new Date() },
        { id: 'm2', name: 'Pedro López', phone: '987654321', email: 'pedro@example.com', rolCelula: 'miembro', addedAt: new Date() },
        { id: 'm3', name: 'Ana Martínez', phone: '456789123', email: 'ana@example.com', rolCelula: 'colider', addedAt: new Date() },
        { id: 'm4', name: 'Carlos Nuevo', phone: '321654987', email: 'carlos@example.com', rolCelula: 'nuevo', addedAt: new Date() },
      ],
      createdAt: new Date(),
    },
  ]);

  const [asistencias, setAsistencias] = useState<AsistenciaRecord[]>([]);

  const addCelula = (celula: Celula) => {
    setCelulas([...celulas, celula]);
    // TODO: Llamar a API para guardar
  };

  const updateCelula = (id: string, updatedData: Partial<Celula>) => {
    setCelulas(celulas.map(c => c.id === id ? { ...c, ...updatedData } : c));
    // TODO: Llamar a API para actualizar
  };

  const deleteCelula = (id: string) => {
    setCelulas(celulas.filter(c => c.id !== id));
    // TODO: Llamar a API para eliminar
  };

  const addMiembroToCelula = (celulaId: string, miembro: Miembro) => {
    setCelulas(celulas.map(c => {
      if (c.id === celulaId) {
        return { ...c, miembros: [...c.miembros, miembro] };
      }
      return c;
    }));
    // TODO: Llamar a API
  };

  const removeMiembroFromCelula = (celulaId: string, miembroId: string) => {
    setCelulas(celulas.map(c => {
      if (c.id === celulaId) {
        return { ...c, miembros: c.miembros.filter(m => m.id !== miembroId) };
      }
      return c;
    }));
    // TODO: Llamar a API
  };

  const addColiderToCelula = (celulaId: string, colider: CoLider) => {
    setCelulas(celulas.map(c => {
      if (c.id === celulaId) {
        return { ...c, colideres: [...c.colideres, colider] };
      }
      return c;
    }));
    // TODO: Llamar a API
  };

  const removeColiderFromCelula = (celulaId: string, coliderId: string) => {
    setCelulas(celulas.map(c => {
      if (c.id === celulaId) {
        return { ...c, colideres: c.colideres.filter(col => col.id !== coliderId) };
      }
      return c;
    }));
    // TODO: Llamar a API
  };

  const updateMiembroRol = (celulaId: string, miembroId: string, nuevoRol: 'miembro' | 'colider' | 'nuevo') => {
    setCelulas(celulas.map(c => {
      if (c.id === celulaId) {
        return {
          ...c,
          miembros: c.miembros.map(m =>
            m.id === miembroId ? { ...m, rolCelula: nuevoRol } : m
          ),
        };
      }
      return c;
    }));
    // TODO: Llamar a API
  };

  const registrarAsistencia = (asistencia: AsistenciaRecord) => {
    setAsistencias([...asistencias, asistencia]);
    // TODO: Llamar a API
  };
updateMiembroRol,
    
  const getCelulaById = (id: string) => {
    return celulas.find(c => c.id === id);
  };

  const value = {
    celulas,
    asistencias,
    addCelula,
    updateCelula,
    deleteCelula,
    addMiembroToCelula,
    removeMiembroFromCelula,
    addColiderToCelula,
    removeColiderFromCelula,
    registrarAsistencia,
    getCelulaById,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
