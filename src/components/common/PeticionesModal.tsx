import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { AlertCircle, Clock, Heart, X, Eye, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PrioridadAnotacion, MotivoFalta } from '../../types';

interface PeticionesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PeticionesModal: React.FC<PeticionesModalProps> = ({ isOpen, onClose }) => {
  const { celulas, asistencias, registrarAccionPastoral } = useData();
  const [filtroActivo, setFiltroActivo] = useState<'todas' | 'alta' | 'media' | 'baja'>('todas');
  const [tipoFiltro, setTipoFiltro] = useState<'todas' | 'presentes' | 'ausentes'>('todas');
  const [resolucionFiltro, setResolucionFiltro] = useState<'pendiente' | 'resuelta' | 'todas'>('pendiente');
  const [editandoAccion, setEditandoAccion] = useState<{ id: string, texto: string } | null>(null);

  if (!isOpen) return null;

  // Obtener todas las anotaciones con datos completos
  const obtenerTodasLasAnotaciones = () => {
    const anotaciones: Array<{
      id: string;
      asistenciaId: string;
      celulaId: string;
      celulaNombre: string;
      miembroId: string;
      miembroNombre: string;
      fecha: Date;
      presente: boolean;
      anotacion: string;
      prioridad: PrioridadAnotacion;
      motivoFalta?: MotivoFalta;
      motivoPersonalizado?: string;
      registradoPor: string;
      accionPastoral?: string;
      resuelta: boolean;
      fechaResolucion?: string;
    }> = [];

    asistencias.forEach(asistencia => {
      const celula = celulas.find(c => c.id === asistencia.celulaId);
      if (!celula) return;

      asistencia.miembros.forEach(miembroAsistencia => {
        const miembro = celula.miembros.find(m => m.id === miembroAsistencia.miembroId);
        if (!miembro) return;

        // Anotaciones para presentes
        if (miembroAsistencia.presente && miembroAsistencia.anotacionEspecial && miembroAsistencia.prioridadAnotacion) {
          anotaciones.push({
            id: `${asistencia.id}-${miembroAsistencia.miembroId}`,
            asistenciaId: asistencia.id,
            celulaId: asistencia.celulaId,
            celulaNombre: celula.name,
            miembroId: miembro.id,
            miembroNombre: miembro.name,
            fecha: asistencia.date,
            presente: true,
            anotacion: miembroAsistencia.anotacionEspecial,
            prioridad: miembroAsistencia.prioridadAnotacion,
            registradoPor: asistencia.registradoPor,
            accionPastoral: miembroAsistencia.accionPastoral,
            resuelta: !!miembroAsistencia.resuelta,
            fechaResolucion: miembroAsistencia.fechaResolucion
          });
        }

        // Anotaciones para ausentes con motivos importantes
        if (!miembroAsistencia.presente && miembroAsistencia.motivoFalta && miembroAsistencia.prioridadAnotacion) {
          let anotacionTexto = '';

          if (miembroAsistencia.motivoFalta === 'otro' && miembroAsistencia.motivoPersonalizado) {
            anotacionTexto = miembroAsistencia.motivoPersonalizado;
          } else {
            const motivosTexto = {
              'enfermedad': 'Ausente por enfermedad',
              'familia': 'Situación familiar',
              'trabajo': 'Compromisos laborales',
              'viaje': 'De viaje',
              'vacaciones': 'En vacaciones',
              'sin-motivo': 'Sin motivo específico',
              'otro': miembroAsistencia.motivoPersonalizado || 'Otro motivo'
            };
            anotacionTexto = (motivosTexto as any)[miembroAsistencia.motivoFalta];
          }

          anotaciones.push({
            id: `${asistencia.id}-${miembroAsistencia.miembroId}`,
            asistenciaId: asistencia.id,
            celulaId: asistencia.celulaId,
            celulaNombre: celula.name,
            miembroId: miembro.id,
            miembroNombre: miembro.name,
            fecha: asistencia.date,
            presente: false,
            anotacion: anotacionTexto,
            prioridad: miembroAsistencia.prioridadAnotacion,
            motivoFalta: miembroAsistencia.motivoFalta,
            motivoPersonalizado: miembroAsistencia.motivoPersonalizado,
            registradoPor: asistencia.registradoPor,
            accionPastoral: miembroAsistencia.accionPastoral,
            resuelta: !!miembroAsistencia.resuelta,
            fechaResolucion: miembroAsistencia.fechaResolucion
          });
        }
      });
    });

    return anotaciones.sort((a, b) => {
      // Primero por estado (pendientes arriba)
      if (a.resuelta !== b.resuelta) return a.resuelta ? 1 : -1;
      // Luego por prioridad (alta primero)
      const prioridadOrden = { 'alta': 3, 'media': 2, 'baja': 1 };
      if (prioridadOrden[a.prioridad] !== prioridadOrden[b.prioridad]) {
        return prioridadOrden[b.prioridad] - prioridadOrden[a.prioridad];
      }
      // Luego por fecha (más recientes primero)
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
  };

  const anotaciones = obtenerTodasLasAnotaciones();

  // Aplicar filtros
  const anotacionesFiltradas = anotaciones.filter(anotacion => {
    const cumpleFiltroTipo = tipoFiltro === 'todas' ||
      (tipoFiltro === 'presentes' && anotacion.presente) ||
      (tipoFiltro === 'ausentes' && !anotacion.presente);

    const cumplePrioridad = filtroActivo === 'todas' || anotacion.prioridad === filtroActivo;

    const cumpleResolucion = resolucionFiltro === 'todas' ||
      (resolucionFiltro === 'resuelta' && anotacion.resuelta) ||
      (resolucionFiltro === 'pendiente' && !anotacion.resuelta);

    return cumpleFiltroTipo && cumplePrioridad && cumpleResolucion;
  });

  const handleGuardarAccion = async (anotacion: any) => {
    if (!editandoAccion) return;
    try {
      await registrarAccionPastoral(anotacion.asistenciaId, anotacion.miembroId, editandoAccion.texto, true);
      setEditandoAccion(null);
    } catch (error) {
      alert('Error al guardar la acción');
    }
  };

  const getPrioridadColor = (prioridad: PrioridadAnotacion) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baja': return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getPrioridadIcon = (prioridad: PrioridadAnotacion) => {
    switch (prioridad) {
      case 'alta': return <AlertCircle className="w-4 h-4" />;
      case 'media': return <Clock className="w-4 h-4" />;
      case 'baja': return <Heart className="w-4 h-4" />;
    }
  };

  const contadores = {
    alta: anotaciones.filter(a => a.prioridad === 'alta' && !a.resuelta).length,
    media: anotaciones.filter(a => a.prioridad === 'media' && !a.resuelta).length,
    baja: anotaciones.filter(a => a.prioridad === 'baja' && !a.resuelta).length,
    pendientes: anotaciones.filter(a => !a.resuelta).length,
    resueltas: anotaciones.filter(a => a.resuelta).length
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8 border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Panel Pastoral de Seguimiento</h3>
              <p className="text-orange-100 text-xs uppercase tracking-wider font-semibold">Gestión de peticiones y necesidades</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {/* Resumen de contadores */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white border-2 border-red-100 rounded-2xl p-4 shadow-sm text-center">
              <div className="text-3xl font-black text-red-600">{contadores.alta}</div>
              <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1">Críticos</div>
            </div>
            <div className="bg-white border-2 border-yellow-100 rounded-2xl p-4 shadow-sm text-center">
              <div className="text-3xl font-black text-yellow-600">{contadores.media}</div>
              <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mt-1">Intermedios</div>
            </div>
            <div className="bg-white border-2 border-green-100 rounded-2xl p-4 shadow-sm text-center">
              <div className="text-3xl font-black text-green-600">{contadores.baja}</div>
              <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mt-1">Atención</div>
            </div>
            <div className="bg-white border-2 border-orange-100 rounded-2xl p-4 shadow-sm text-center">
              <div className="text-3xl font-black text-orange-600">{contadores.pendientes}</div>
              <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">Pendientes</div>
            </div>
            <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-sm text-center">
              <div className="text-3xl font-black text-blue-600">{contadores.resueltas}</div>
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Atendidos</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-8 space-y-4">
            <div className="flex flex-wrap gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolución</span>
                <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                  {(['pendiente', 'resuelta', 'todas'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setResolucionFiltro(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${resolucionFiltro === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prioridad</span>
                <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
                  {(['todas', 'alta', 'media', 'baja'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFiltroActivo(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filtroActivo === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de anotaciones */}
          <div className="space-y-4">
            {anotacionesFiltradas.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-10 h-10 text-gray-300" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Todo bajo control</h4>
                <p className="text-gray-500 max-w-xs mx-auto">No hay peticiones que coincidan con estos filtros.</p>
              </div>
            ) : (
              anotacionesFiltradas.map((anotacion) => (
                <div key={anotacion.id} className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${anotacion.resuelta ? 'border-gray-100 opacity-75' : 'border-white shadow-sm hover:shadow-md'
                  }`}>
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${getPrioridadColor(anotacion.prioridad)}`}>
                            {anotacion.prioridad}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${anotacion.presente ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {anotacion.presente ? 'Presente' : 'Ausente'}
                          </div>
                          {anotacion.resuelta && (
                            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border-2 border-blue-100">
                              Atendido
                            </div>
                          )}
                          <span className="ml-auto text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {format(new Date(anotacion.fecha), 'EEEE, d MMMM', { locale: es })}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${anotacion.resuelta ? 'bg-gray-100 text-gray-400' : 'bg-orange-100 text-orange-600'
                            }`}>
                            {anotacion.miembroNombre.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-lg font-black text-gray-900">{anotacion.miembroNombre}</h5>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{anotacion.celulaNombre}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative">
                          <MessageSquare className="w-8 h-8 text-white absolute -top-2 -left-2 fill-gray-200" />
                          <p className="text-gray-700 text-sm font-medium leading-relaxed relative z-10">
                            {anotacion.anotacion}
                          </p>
                        </div>
                      </div>

                      <div className="lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-center">
                        {anotacion.resuelta ? (
                          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                            <h6 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Acción Realizada</h6>
                            <p className="text-sm font-bold text-blue-900 mb-2 italic">"{anotacion.accionPastoral}"</p>
                            <p className="text-[10px] text-blue-400">Atendido el {anotacion.fechaResolucion ? format(new Date(anotacion.fechaResolucion), 'dd/MM HH:mm') : '-'}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registrar Seguimiento</h6>
                            {editandoAccion?.id === anotacion.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editandoAccion.texto}
                                  onChange={(e) => setEditandoAccion({ ...editandoAccion, texto: e.target.value })}
                                  placeholder="Ej: Se visitó y se oró por..."
                                  className="w-full text-xs font-bold p-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 outline-none h-24 resize-none transition-all"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleGuardarAccion(anotacion)}
                                    className="flex-1 bg-gray-900 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-black transition-colors"
                                  >
                                    Cerrar Petición
                                  </button>
                                  <button
                                    onClick={() => setEditandoAccion(null)}
                                    className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditandoAccion({ id: anotacion.id, texto: '' })}
                                className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 flex flex-col items-center justify-center group hover:border-orange-300 hover:bg-orange-50 transition-all"
                              >
                                <Heart className="w-6 h-6 text-gray-300 group-hover:text-orange-500 transition-colors mb-2" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-orange-700">Atender ahora</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 border-t shrink-0 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors tracking-wide"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};