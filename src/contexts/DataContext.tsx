import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Celula, Miembro, CoLider, AsistenciaRecord, MotivoFalta, Noticia, MaterialCelula, ConfiguracionDonaciones, PendienteAsistencia } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  celulas: Celula[];
  asistencias: AsistenciaRecord[];
  noticias: Noticia[];
  materiales: MaterialCelula[];
  configuracionDonaciones: ConfiguracionDonaciones;
  pendientesAsistencia: PendienteAsistencia[];
  loading: boolean;

  // Funciones de células
  addCelula: (celula: Celula) => Promise<void>;
  updateCelula: (id: string, celula: Partial<Celula>) => Promise<void>;
  deleteCelula: (id: string) => Promise<void>;
  recargarCelulas: () => Promise<void>;
  addMiembroToCelula: (celulaId: string, miembro: Miembro) => Promise<void>;
  removeMiembroFromCelula: (celulaId: string, miembroId: string) => Promise<void>;
  addColiderToCelula: (celulaId: string, colider: CoLider) => Promise<void>;
  removeColiderFromCelula: (celulaId: string, coliderId: string) => Promise<void>;
  updateMiembroRol: (celulaId: string, miembroId: string, nuevoRol: 'miembro' | 'colider' | 'nuevo' | 'timoteo') => Promise<void>;

  // Funciones de asistencia
  registrarAsistencia: (asistencia: AsistenciaRecord) => Promise<void>;
  actualizarMotivoFalta: (asistenciaId: string, miembroId: string, motivo: MotivoFalta, motivoPersonalizado?: string) => Promise<void>;
  marcarAsistenciaCompletada: (asistenciaId: string) => Promise<void>;

  // Funciones de noticias
  agregarNoticia: (noticia: Omit<Noticia, 'id' | 'fechaCreacion'>) => Promise<void>;
  actualizarNoticia: (id: string, noticia: Partial<Noticia>) => Promise<void>;
  eliminarNoticia: (id: string) => Promise<void>;

  // Funciones de materiales
  subirMaterial: (material: Omit<MaterialCelula, 'id' | 'fechaSubida'>) => Promise<void>;
  eliminarMaterial: (id: string) => Promise<void>;

  // Funciones de donaciones
  actualizarConfiguracionDonaciones: (config: Partial<ConfiguracionDonaciones>) => Promise<void>;

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
  const { user } = useAuth();
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaRecord[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [materiales, setMateriales] = useState<MaterialCelula[]>([]);
  const [configuracionDonaciones, setConfiguracionDonaciones] = useState<ConfiguracionDonaciones>({
    aliasIglesia: '',
    descripcion: '',
    activo: false,
    fechaActualizacion: new Date(),
    actualizadoPor: ''
  });
  const [pendientesAsistencia, setPendientesAsistencia] = useState<PendienteAsistencia[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales cuando el usuario está autenticado
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Cargar células según el rol
      if (user?.role === 'admin' || user?.role === 'pastor') {
        const celulasData = await api.getCelulas() as any[];
        // Transformar datos de la API al formato esperado por el frontend
        const celulasTransformadas = celulasData.map((c: any) => ({
          id: c.id,
          name: c.nombre,
          liderId: c.liderId,
          liderName: c.lider?.name || '',
          diaSemana: c.dia,
          horario: c.horario,
          coLideres: c.coLideres || [],
          miembros: (c.miembros || []).map((m: any) => ({
            ...m,
            name: m.nombre,
            phone: m.telefono
          })),
          createdAt: new Date(c.createdAt)
        }));
        setCelulas(celulasTransformadas);
      } else if (user?.role === 'lider' || user?.role === 'colider') {
        const miCelula = await api.getMiCelula() as any;
        if (miCelula) {
          const celulaTransformada = {
            id: miCelula.id,
            name: miCelula.nombre,
            liderId: miCelula.liderId,
            liderName: miCelula.lider?.name || '',
            diaSemana: miCelula.dia,
            horario: miCelula.horario,
            coLideres: miCelula.coLideres || [],
            miembros: (miCelula.miembros || []).map((m: any) => ({
              ...m,
              name: m.nombre,
              phone: m.telefono
            })),
            createdAt: new Date(miCelula.createdAt)
          };
          setCelulas([celulaTransformada]);
        }
      }

      // Cargar noticias
      const noticiasData = await api.getNoticias() as any[];
      const noticiasTransformadas = noticiasData.map((n: any) => ({
        id: n.id,
        titulo: n.titulo,
        contenido: n.contenido,
        fechaCreacion: new Date(n.fechaPublicacion || n.createdAt),
        fechaVencimiento: n.fechaVencimiento ? new Date(n.fechaVencimiento) : undefined,
        importante: n.importante,
        creadoPor: n.createdBy || n.creator?.id || '',
        visible: n.activa
      }));
      setNoticias(noticiasTransformadas);

      // Cargar materiales
      const materialesData = await api.getMateriales() as any[];
      const materialesTransformados = materialesData.map((m: any) => ({
        id: m.id,
        titulo: m.titulo,
        descripcion: m.descripcion,
        archivoUrl: m.nombreArchivo,
        nombreArchivo: m.nombreArchivo,
        fechaSubida: new Date(m.fechaSubida),
        subidoPor: m.subidoPorId || '',
        activo: m.activo
      }));
      setMateriales(materialesTransformados);

      // Cargar configuración de donaciones
      const donacionesConfig = await api.getConfiguracionDonaciones() as any;
      if (donacionesConfig) {
        setConfiguracionDonaciones({
          aliasIglesia: donacionesConfig.aliasIglesia || '',
          descripcion: donacionesConfig.cbuIglesia || '',
          activo: donacionesConfig.activo || false,
          fechaActualizacion: donacionesConfig.fechaCreacion ? new Date(donacionesConfig.fechaCreacion) : new Date(),
          actualizadoPor: donacionesConfig.actualizadoPorId || ''
        });
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCelula = async (celula: Celula) => {
    try {
      const nuevaCelula = await api.crearCelula(celula) as Celula;
      setCelulas([...celulas, nuevaCelula]);
    } catch (error) {
      console.error('Error adding celula:', error);
      throw error;
    }
  };

  const recargarCelulas = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'pastor') {
        const celulasData = await api.getCelulas() as any[];
        const celulasTransformadas = celulasData.map((c: any) => ({
          id: c.id,
          name: c.nombre,
          liderId: c.liderId,
          liderName: c.lider?.name || '',
          diaSemana: c.dia,
          horario: c.horario,
          coLideres: c.coLideres || [],
          miembros: c.miembros || [],
          createdAt: new Date(c.createdAt)
        }));
        setCelulas(celulasTransformadas);
      }
    } catch (error) {
      console.error('Error reloading celulas:', error);
      throw error;
    }
  };

  const updateCelula = async (id: string, updatedData: Partial<Celula>) => {
    try {
      const celulaActualizada = await api.actualizarCelula(id, updatedData) as Celula;
      setCelulas(celulas.map(c => c.id === id ? celulaActualizada : c));
    } catch (error) {
      console.error('Error updating celula:', error);
      throw error;
    }
  };

  const deleteCelula = async (id: string) => {
    try {
      await api.eliminarCelula(id);
      setCelulas(celulas.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting celula:', error);
      throw error;
    }
  };

  const addMiembroToCelula = async (celulaId: string, miembro: Miembro) => {
    try {
      const res = await api.addMiembro(celulaId, miembro) as any;
      const nuevoMiembro = {
        ...res,
        name: res.nombre,
        phone: res.telefono
      } as Miembro;
      setCelulas(celulas.map(c => {
        if (c.id === celulaId) {
          return { ...c, miembros: [...c.miembros, nuevoMiembro] };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error adding miembro:', error);
      throw error;
    }
  };

  const removeMiembroFromCelula = async (celulaId: string, miembroId: string) => {
    try {
      await api.removeMiembro(celulaId, miembroId);
      setCelulas(celulas.map(c => {
        if (c.id === celulaId) {
          return { ...c, miembros: c.miembros.filter(m => m.id !== miembroId) };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error removing miembro:', error);
      throw error;
    }
  };

  const addColiderToCelula = async (celulaId: string, colider: CoLider) => {
    try {
      const nuevoColider = await api.addColider(celulaId, colider) as CoLider;
      setCelulas(celulas.map(c => {
        if (c.id === celulaId) {
          return { ...c, coLideres: [...c.coLideres, nuevoColider] };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error adding colider:', error);
      throw error;
    }
  };

  const removeColiderFromCelula = async (celulaId: string, coliderId: string) => {
    try {
      await api.removeColider(celulaId, coliderId);
      setCelulas(celulas.map(c => {
        if (c.id === celulaId) {
          return { ...c, coLideres: c.coLideres.filter(col => col.id !== coliderId) };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error removing colider:', error);
      throw error;
    }
  };

  const updateMiembroRol = async (celulaId: string, miembroId: string, nuevoRol: 'miembro' | 'colider' | 'nuevo' | 'timoteo') => {
    try {
      // TODO: Implementar endpoint en API para actualizar rol de miembro
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
    } catch (error) {
      console.error('Error updating miembro rol:', error);
      throw error;
    }
  };

  const registrarAsistencia = async (asistencia: AsistenciaRecord) => {
    try {
      const nuevaAsistencia = await api.registrarAsistencia(asistencia) as AsistenciaRecord;
      setAsistencias([...asistencias, nuevaAsistencia]);

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
    } catch (error) {
      console.error('Error registering asistencia:', error);
      throw error;
    }
  };

  const actualizarMotivoFalta = async (asistenciaId: string, miembroId: string, motivo: MotivoFalta, motivoPersonalizado?: string) => {
    try {
      // TODO: Implementar endpoint en API
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
    } catch (error) {
      console.error('Error updating motivo falta:', error);
      throw error;
    }
  };

  const marcarAsistenciaCompletada = async (asistenciaId: string) => {
    try {
      // TODO: Implementar endpoint en API
      setAsistencias(asistencias.map(a =>
        a.id === asistenciaId ? { ...a, completado: true } : a
      ));
      setPendientesAsistencia(pendientesAsistencia.filter(p => p.asistenciaId !== asistenciaId));
    } catch (error) {
      console.error('Error marking asistencia as completed:', error);
      throw error;
    }
  };

  // Funciones de noticias
  const agregarNoticia = async (noticia: Omit<Noticia, 'id' | 'fechaCreacion'>) => {
    try {
      const nuevaNoticia = await api.crearNoticia(noticia) as Noticia;
      setNoticias([...noticias, nuevaNoticia]);
    } catch (error) {
      console.error('Error adding noticia:', error);
      throw error;
    }
  };

  const actualizarNoticia = async (id: string, noticia: Partial<Noticia>) => {
    try {
      const noticiaActualizada = await api.actualizarNoticia(id, noticia) as Noticia;
      setNoticias(noticias.map(n => n.id === id ? noticiaActualizada : n));
    } catch (error) {
      console.error('Error updating noticia:', error);
      throw error;
    }
  };

  const eliminarNoticia = async (id: string) => {
    try {
      await api.eliminarNoticia(id);
      setNoticias(noticias.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting noticia:', error);
      throw error;
    }
  };

  // Funciones de materiales
  const subirMaterial = async (material: Omit<MaterialCelula, 'id' | 'fechaSubida'>) => {
    try {
      const nuevoMaterial = await api.subirMaterial(material) as MaterialCelula;
      setMateriales([...materiales, nuevoMaterial]);
    } catch (error) {
      console.error('Error uploading material:', error);
      throw error;
    }
  };

  const eliminarMaterial = async (id: string) => {
    try {
      await api.eliminarMaterial(id);
      setMateriales(materiales.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  };

  // Funciones de donaciones
  const actualizarConfiguracionDonaciones = async (config: Partial<ConfiguracionDonaciones>) => {
    try {
      const configActualizada = await api.actualizarConfiguracionDonaciones(config) as ConfiguracionDonaciones;
      setConfiguracionDonaciones(configActualizada);
    } catch (error) {
      console.error('Error updating donaciones config:', error);
      throw error;
    }
  };

  const getCelulaById = (id: string) => {
    return celulas.find(c => c.id === id);
  };

  const getPendientesAsistencia = (liderId: string) => {
    const celulasLider = celulas.filter(c => c.liderId === liderId || c.coLideres.some(col => col.id === liderId));
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
    loading,
    addCelula,
    updateCelula,
    deleteCelula,
    recargarCelulas,
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
