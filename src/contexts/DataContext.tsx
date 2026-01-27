import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Celula, Miembro, CoLider, AsistenciaRecord, MotivoFalta, Noticia, MaterialCelula, ConfiguracionDonaciones, PendienteAsistencia, PeticionPastor } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  celulas: Celula[];
  asistencias: AsistenciaRecord[];
  noticias: Noticia[];
  materiales: MaterialCelula[];
  configuracionDonaciones: ConfiguracionDonaciones;
  pendientesAsistencia: PendienteAsistencia[];
  peticionesPastor: PeticionPastor[];
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
  actualizarMotivoFalta: (asistenciaId: string, miembroId: string, motivo: MotivoFalta, motivoPersonalizado?: string, anotacionEspecial?: string) => Promise<void>;
  registrarAccionPastoral: (asistenciaId: string, miembroId: string, accion: string, resuelta: boolean) => Promise<void>;
  marcarAsistenciaCompletada: (asistenciaId: string) => Promise<void>;
  getHistorialAsistencias: (celulaId: string) => Promise<any[]>;

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
  // Siempre obtener el usuario actualizado desde localStorage para evitar datos desactualizados
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  // Refrescar datos de usuario si hay cambios en localStorage
  React.useEffect(() => {
    const handleStorage = () => {
      // Forzar re-render si cambia el usuario
      context.recargarCelulas();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
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
  const [peticionesPastor, setPeticionesPastor] = useState<PeticionPastor[]>([]);
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
      } else if (user?.role === 'lider' || user?.role === 'colider' || user?.role === 'timoteo') {
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
        imageUrl: n.imageUrl,
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
      try {
        const configData = await api.getConfiguracionDonaciones() as any;
        if (configData) {
          setConfiguracionDonaciones({
            aliasIglesia: configData.alias || configData.aliasIglesia || '',
            cbu: configData.cbuOriginal || configData.cbuIglesia || '',
            descripcion: configData.descripcion || '',
            activo: true,
            fechaActualizacion: new Date(),
            actualizadoPor: ''
          });
        }
      } catch (err) {
        console.error('Error fetching donations config:', err);
      }

      // Cargar asistencias según el rol
      try {
        let asistenciasData: any[] = [];
        if (user?.role === 'admin' || user?.role === 'pastor') {
          asistenciasData = await api.getAllAsistencias() as any[];
        } else if (user?.role === 'lider' || user?.role === 'colider') {
          const misCelulas = await api.getCelulas() as any[];
          for (const c of misCelulas) {
            const data = await api.getAsistencias(c.id) as any[];
            asistenciasData = [...asistenciasData, ...data];
          }
        }

        const asistenciasTransformadas = asistenciasData.map((a: any) => ({
          ...a,
          date: new Date(a.date)
        }));
        setAsistencias(asistenciasTransformadas);
      } catch (err) {
        console.error('Error fetching asistencias:', err);
      }

      // Cargar peticiones pendientes (solo para admin/pastor)
      if (user?.role === 'admin' || user?.role === 'pastor') {
        try {
          const dataPeticiones = await api.getPeticionesPastor() as PeticionPastor[];
          setPeticionesPastor(dataPeticiones);
        } catch (err) {
          console.error('Error fetching pastoral petitions:', err);
        }
      }

      // Cargar pendientes de asistencia (para todos)
      try {
        const dataPendientes = await api.getPendientesAsistencia() as PendienteAsistencia[];
        setPendientesAsistencia(dataPendientes);
      } catch (err) {
        console.error('Error fetching pending attendance:', err);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCelula = async (celula: Celula) => {
    try {
      const res = await api.crearCelula(celula) as any;
      const nuevaCelula = res.celula || res;
      setCelulas([...celulas, nuevaCelula]);
      // Sincronizar datos con el backend
      await recargarCelulas();
    } catch (error) {
      console.error('Error adding celula:', error);
      throw error;
    }
  };

  const recargarCelulas = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'pastor') {
        const celulasData = await api.getCelulas() as any[];
        // Transformar datos igual que en loadInitialData
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
      }
    } catch (error) {
      console.error('Error refreshing celulas:', error);
    }
  };

  const updateCelula = async (id: string, updatedData: Partial<Celula>) => {
    try {
      const res = await api.actualizarCelula(id, updatedData) as any;
      const celulaActualizada = res.celula || res;
      setCelulas(celulas.map(c => c.id === id ? celulaActualizada : c));
      // Sincronizar datos con el backend
      await recargarCelulas();
    } catch (error) {
      console.error('Error updating celula:', error);
      throw error;
    }
  };

  const deleteCelula = async (id: string) => {
    try {
      await api.eliminarCelula(id);
      setCelulas(celulas.filter(c => c.id !== id));
      // Sincronizar datos con el backend
      await recargarCelulas();
    } catch (error) {
      console.error('Error deleting celula:', error);
      throw error;
    }
  };

  const addMiembroToCelula = async (celulaId: string, miembro: Miembro) => {
    try {
      const res = await api.addMiembro(celulaId, miembro) as any;
      const m = res.miembro || res;
      const nuevoMiembro: Miembro = {
        ...m,
        name: m.nombre,
        phone: m.telefono
      };
      setCelulas(celulas.map(c => {
        if (c.id === celulaId) {
          return { ...c, miembros: [...c.miembros, nuevoMiembro] };
        }
        return c;
      }));
      // Sincronizar datos con el backend
      await recargarCelulas();
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
      const res = await api.addColider(celulaId, colider) as any;
      const nuevoColider = res.colider || res;
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
      const res = await api.updateMiembro(celulaId, miembroId, { rolCelula: nuevoRol }) as any;
      const m = res.miembro || res;
      const miembroActualizado: Miembro = {
        ...m,
        name: m.nombre,
        phone: m.telefono
      };

      setCelulas(celulas.map(c => {
        if (c.id === celulaId) {
          return {
            ...c,
            miembros: c.miembros.map(miembro => miembro.id === miembroId ? miembroActualizado : miembro)
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
      const res = await api.registrarAsistencia(asistencia) as any;
      const nuevaAsistencia = res.asistencia || res;

      setAsistencias(prev => {
        const index = prev.findIndex(a => a.id === nuevaAsistencia.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = nuevaAsistencia;
          return updated;
        }
        return [...prev, nuevaAsistencia];
      });

      // Recargar pendientes después de registrar
      const dataPendientes = await api.getPendientesAsistencia() as any[];
      setPendientesAsistencia(dataPendientes);
    } catch (error: any) {
      if (error.message && error.message.includes('No tienes permisos')) {
        window.alert(error.message);
      } else {
        console.error('Error registering asistencia:', error);
      }
      throw error;
    }
  };

  const registrarAccionPastoral = async (asistenciaId: string, miembroId: string, accionPastoral: string, resuelta: boolean) => {
    try {
      await api.updateAccionPastoral(asistenciaId, {
        miembroId,
        accionPastoral,
        resuelta
      });

      // Actualizar estado local
      setAsistencias(prev => prev.map(a => {
        if (a.id === asistenciaId) {
          return {
            ...a,
            miembros: a.miembros.map(m => {
              if (m.miembroId === miembroId) {
                return {
                  ...m,
                  accionPastoral,
                  resuelta,
                  fechaResolucion: resuelta ? new Date().toISOString() : undefined,
                  resueltaPorId: resuelta ? user?.id : undefined
                };
              }
              return m;
            })
          };
        }
        return a;
      }));

      // Recargar peticiones para el pastor si es necesario
      if (user?.role === 'admin' || user?.role === 'pastor') {
        const dataPeticiones = await api.getPeticionesPastor() as PeticionPastor[];
        setPeticionesPastor(dataPeticiones);
      }
    } catch (error) {
      console.error('Error updating pastoral action:', error);
      throw error;
    }
  };

  const actualizarMotivoFalta = async (asistenciaId: string, miembroId: string, motivo: MotivoFalta, motivoPersonalizado?: string, anotacionEspecial?: string) => {
    try {
      await api.updateMotivoAsistencia(asistenciaId, {
        miembroId,
        motivoFalta: motivo,
        motivoPersonalizado,
        anotacionEspecial
      });

      // Actualizar estado local de asistencias
      setAsistencias(asistencias.map(a => {
        if (a.id === asistenciaId) {
          const miembrosActualizados = a.miembros.map(m => {
            if (m.miembroId === miembroId) {
              return {
                ...m,
                motivoFalta: motivo,
                motivoPersonalizado,
                anotacionEspecial,
                motivoCompletado: true
              };
            }
            return m;
          });

          const pendientesCount = miembrosActualizados.filter(m => !m.presente && !m.motivoCompletado).length;

          return {
            ...a,
            miembros: miembrosActualizados,
            pendientesCompletar: pendientesCount,
            completado: pendientesCount === 0
          };
        }
        return a;
      }));

      // Actualizar pendientes y peticiones
      const dataPendientes = await api.getPendientesAsistencia() as any[];
      setPendientesAsistencia(dataPendientes);

      if (user?.role === 'admin' || user?.role === 'pastor') {
        const dataPeticiones = await api.getPeticionesPastor() as PeticionPastor[];
        setPeticionesPastor(dataPeticiones);
      }
    } catch (error) {
      console.error('Error updating motivo falta:', error);
      throw error;
    }
  };

  const marcarAsistenciaCompletada = async (asistenciaId: string) => {
    // Esta función podría no ser necesaria si se hace automáticamente en el backend
    // pero la mantenemos por si acaso para forzar el estado
    setAsistencias(asistencias.map(a =>
      a.id === asistenciaId ? { ...a, completado: true, pendientesCompletar: 0 } : a
    ));
  };

  const getHistorialAsistencias = async (celulaId: string) => {
    try {
      const data = await api.getAsistencias(celulaId) as any[];
      return data;
    } catch (error) {
      console.error('Error getting historial:', error);
      return [];
    }
  };

  // Funciones de noticias
  const agregarNoticia = async (noticia: Omit<Noticia, 'id' | 'fechaCreacion'>) => {
    try {
      const n = await api.crearNoticia(noticia) as any;
      const nuevaNoticia: Noticia = {
        id: n.id,
        titulo: n.titulo,
        contenido: n.contenido,
        imageUrl: n.imageUrl,
        fechaCreacion: new Date(n.fechaPublicacion || n.createdAt),
        fechaVencimiento: n.fechaVencimiento ? new Date(n.fechaVencimiento) : undefined,
        importante: n.importante,
        creadoPor: n.createdBy || '',
        visible: n.activa
      };
      setNoticias([...noticias, nuevaNoticia]);
    } catch (error) {
      console.error('Error adding noticia:', error);
      throw error;
    }
  };

  const actualizarNoticia = async (id: string, noticia: Partial<Noticia>) => {
    try {
      const n = await api.actualizarNoticia(id, noticia) as any;
      const noticiaActualizada: Noticia = {
        id: n.id,
        titulo: n.titulo,
        contenido: n.contenido,
        imageUrl: n.imageUrl,
        fechaCreacion: new Date(n.fechaPublicacion || n.createdAt),
        fechaVencimiento: n.fechaVencimiento ? new Date(n.fechaVencimiento) : undefined,
        importante: n.importante,
        creadoPor: n.createdBy || '',
        visible: n.activa
      };
      setNoticias(noticias.map(item => item.id === id ? noticiaActualizada : item));
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
      const res = await api.subirMaterial(material) as any;
      const m = res.material || res;
      const nuevoMaterial: MaterialCelula = {
        id: m.id,
        titulo: m.titulo,
        descripcion: m.descripcion,
        archivoUrl: m.nombreArchivo,
        nombreArchivo: m.nombreArchivo,
        fechaSubida: new Date(m.fechaSubida),
        subidoPor: m.subidoPorId || '',
        activo: m.activo
      };
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
      // Mapeo de cbu (frontend) a cbuIglesia (backend)
      const dataToSave = {
        aliasIglesia: config.aliasIglesia || '',
        cbuIglesia: config.cbu || '',
        descripcion: config.descripcion || ''
      };

      const res = await api.actualizarConfiguracionDonaciones(dataToSave) as any;
      const c = res.configuracion || res;

      // Mapeo de respuesta a tipo frontend
      const configActualizada: ConfiguracionDonaciones = {
        aliasIglesia: c.aliasIglesia,
        cbu: c.cbuIglesia,
        descripcion: c.descripcion || '',
        activo: c.activo,
        fechaActualizacion: new Date(c.updatedAt || c.fechaCreacion),
        actualizadoPor: c.actualizadoPorId
      };

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
    peticionesPastor,
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
    registrarAccionPastoral,
    marcarAsistenciaCompletada,
    agregarNoticia,
    actualizarNoticia,
    eliminarNoticia,
    subirMaterial,
    eliminarMaterial,
    actualizarConfiguracionDonaciones,
    getCelulaById,
    getPendientesAsistencia,
    getHistorialAsistencias,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
