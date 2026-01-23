import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Celula, Miembro, CoLider, AsistenciaRecord, MotivoFalta, Noticia, MaterialCelula, ConfiguracionDonaciones, PendienteAsistencia } from '../types';

interface DataContextType {
  celulas: Celula[];
  asistencias: AsistenciaRecord[];
  noticias: Noticia[];
  materiales: MaterialCelula[];
  configuracionDonaciones: ConfiguracionDonaciones;
  pendientesAsistencia: PendienteAsistencia[];
  
  // Funciones de células
  addCelula: (celula: Celula) => void;
  updateCelula: (id: string, celula: Partial<Celula>) => void;
  deleteCelula: (id: string) => void;
  addMiembroToCelula: (celulaId: string, miembro: Miembro) => void;
  removeMiembroFromCelula: (celulaId: string, miembroId: string) => void;
  addColiderToCelula: (celulaId: string, colider: CoLider) => void;
  removeColiderFromCelula: (celulaId: string, coliderId: string) => void;
  updateMiembroRol: (celulaId: string, miembroId: string, nuevoRol: 'miembro' | 'colider' | 'nuevo') => void;
  
  // Funciones de asistencia
  registrarAsistencia: (asistencia: AsistenciaRecord) => void;
  actualizarMotivoFalta: (asistenciaId: string, miembroId: string, motivo: MotivoFalta, motivoPersonalizado?: string) => void;
  marcarAsistenciaCompletada: (asistenciaId: string) => void;
  
  // Funciones de noticias
  agregarNoticia: (noticia: Omit<Noticia, 'id' | 'fechaCreacion'>) => void;
  actualizarNoticia: (id: string, noticia: Partial<Noticia>) => void;
  eliminarNoticia: (id: string) => void;
  
  // Funciones de materiales
  subirMaterial: (material: Omit<MaterialCelula, 'id' | 'fechaSubida'>) => void;
  eliminarMaterial: (id: string) => void;
  
  // Funciones de donaciones
  actualizarConfiguracionDonaciones: (config: Partial<ConfiguracionDonaciones>) => void;
  
  // Utilidades
  getCelulaById: (id: string) => Celula | undefined;
  getPendientesAsistencia: (liderId: string) => PendienteAsistencia[];
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
      liderId: '3',
      liderName: 'Juan Pérez',
      diaSemana: 'Viernes',
      horario: '19:00',
      colideres: [
        {
          id: '4',
          name: 'María González',
          email: 'colider@renacer.com',
          addedAt: new Date('2024-01-15'),
        },
      ],
      miembros: [
        { id: 'm1', name: 'María García', phone: '123456789', email: 'maria@example.com', rolCelula: 'miembro', addedAt: new Date(), isBautizado: true, tieneDiscipulado: true },
        { id: 'm2', name: 'Pedro López', phone: '987654321', email: 'pedro@example.com', rolCelula: 'miembro', addedAt: new Date(), isBautizado: true, tieneDiscipulado: false },
        { id: 'm3', name: 'Ana Martínez', phone: '456789123', email: 'ana@example.com', rolCelula: 'colider', addedAt: new Date(), isBautizado: false, tieneDiscipulado: false },
        { id: 'm4', name: 'Carlos Nuevo', phone: '321654987', email: 'carlos@example.com', rolCelula: 'nuevo', addedAt: new Date(), isBautizado: false, tieneDiscipulado: false },
      ],
      createdAt: new Date(),
    },
  ]);

  const [asistencias, setAsistencias] = useState<AsistenciaRecord[]>([]);
  
  // Estado para noticias
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  
  // Estado para materiales de célula
  const [materiales, setMateriales] = useState<MaterialCelula[]>([]);
  
  // Estado para configuración de donaciones
  const [configuracionDonaciones, setConfiguracionDonaciones] = useState<ConfiguracionDonaciones>({
    aliasIglesia: 'IGLESIA.RENACER.MP',
    descripcion: 'Tu donación ayuda a que nuestra iglesia pueda seguir cumpliendo la misión de llevar esperanza a las familias.',
    activo: true,
    fechaActualizacion: new Date(),
    actualizadoPor: ''
  });
  
  // Estado para pendientes de asistencia
  const [pendientesAsistencia, setPendientesAsistencia] = useState<PendienteAsistencia[]>([]);

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
    
    // Crear pendientes para ausentes sin motivo
    const miembrosSinMotivo = asistencia.miembros
      .filter(m => !m.presente && !m.motivoCompletado)
      .map(m => {
        const miembro = getCelulaById(asistencia.celulaId)?.miembros.find(mb => mb.id === m.miembroId);
        return {
          miembroId: m.miembroId,
          miembroNombre: miembro?.name || 'Desconocido'
        };
      });
    
    if (miembrosSinMotivo.length > 0) {
      const celula = getCelulaById(asistencia.celulaId);
      const pendiente: PendienteAsistencia = {
        asistenciaId: asistencia.id,
        celulaId: asistencia.celulaId,
        celulaNombre: celula?.name || 'Desconocida',
        fecha: asistencia.date,
        miembrosPendientes: miembrosSinMotivo,
        cantidadPendientes: miembrosSinMotivo.length
      };
      setPendientesAsistencia([...pendientesAsistencia, pendiente]);
    }
    
    // TODO: Llamar a API
  };
  
  const actualizarMotivoFalta = (asistenciaId: string, miembroId: string, motivo: MotivoFalta, motivoPersonalizado?: string) => {
    setAsistencias(asistencias.map(a => {
      if (a.id === asistenciaId) {
        const miembrosActualizados = a.miembros.map(m => {
          if (m.miembroId === miembroId) {
            return {
              ...m,
              motivoFalta: motivo,
              motivoPersonalizado,
              motivoCompletado: true
            };
          }
          return m;
        });
        
        const pendientesCompletar = miembrosActualizados.filter(m => !m.presente && !m.motivoCompletado).length;
        const completado = pendientesCompletar === 0;
        
        return {
          ...a,
          miembros: miembrosActualizados,
          pendientesCompletar,
          completado
        };
      }
      return a;
    }));
    
    // Actualizar pendientes
    setPendientesAsistencia(pendientesAsistencia.map(p => {
      if (p.asistenciaId === asistenciaId) {
        const miembrosPendientes = p.miembrosPendientes.filter(mp => mp.miembroId !== miembroId);
        return {
          ...p,
          miembrosPendientes,
          cantidadPendientes: miembrosPendientes.length
        };
      }
      return p;
    }).filter(p => p.cantidadPendientes > 0));
    
    // TODO: Llamar a API
  };
  
  const marcarAsistenciaCompletada = (asistenciaId: string) => {
    setAsistencias(asistencias.map(a => 
      a.id === asistenciaId ? { ...a, completado: true } : a
    ));
    setPendientesAsistencia(pendientesAsistencia.filter(p => p.asistenciaId !== asistenciaId));
    // TODO: Llamar a API
  };
  
  // Funciones de noticias
  const agregarNoticia = (noticia: Omit<Noticia, 'id' | 'fechaCreacion'>) => {
    const nuevaNoticia: Noticia = {
      ...noticia,
      id: Date.now().toString(),
      fechaCreacion: new Date()
    };
    setNoticias([...noticias, nuevaNoticia]);
    // TODO: Llamar a API
  };
  
  const actualizarNoticia = (id: string, noticia: Partial<Noticia>) => {
    setNoticias(noticias.map(n => n.id === id ? { ...n, ...noticia } : n));
    // TODO: Llamar a API
  };
  
  const eliminarNoticia = (id: string) => {
    setNoticias(noticias.filter(n => n.id !== id));
    // TODO: Llamar a API
  };
  
  // Funciones de materiales
  const subirMaterial = (material: Omit<MaterialCelula, 'id' | 'fechaSubida'>) => {
    const nuevoMaterial: MaterialCelula = {
      ...material,
      id: Date.now().toString(),
      fechaSubida: new Date()
    };
    setMateriales([...materiales, nuevoMaterial]);
    // TODO: Llamar a API
  };
  
  const eliminarMaterial = (id: string) => {
    setMateriales(materiales.filter(m => m.id !== id));
    // TODO: Llamar a API
  };
  
  // Funciones de donaciones
  const actualizarConfiguracionDonaciones = (config: Partial<ConfiguracionDonaciones>) => {
    setConfiguracionDonaciones({
      ...configuracionDonaciones,
      ...config,
      fechaActualizacion: new Date()
    });
    // TODO: Llamar a API
  };

  const getCelulaById = (id: string) => {
    return celulas.find(c => c.id === id);
  };

  const getPendientesAsistencia = (liderId: string) => {
    const celulasLider = celulas.filter(c => c.liderId === liderId || c.colideres.some(col => col.id === liderId));
    const idscelulas = celulasLider.map(c => c.id);
    return pendientesAsistencia.filter(p => idscelulas.includes(p.celulaId));
  };

  const value = {
    celulas,
    asistencias,
    noticias,
    materiales,
    configuracionDonaciones,
    pendientesAsistencia,
    addCelula,
    updateCelula,
    deleteCelula,
    addMiembroToCelula,
    removeMiembroFromCelula,
    addColiderToCelula,
    removeColiderFromCelula,
    updateMiembroRol,
    registrarAsistencia,
    actualizarMotivoFalta,
    marcarAsistenciaCompletada,
    agregarNoticia,
    actualizarNoticia,
    eliminarNoticia,
    subirMaterial,
    eliminarMaterial,
    actualizarConfiguracionDonaciones,
    getCelulaById,
    getPendientesAsistencia,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
