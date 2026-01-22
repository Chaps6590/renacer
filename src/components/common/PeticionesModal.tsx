import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { AlertCircle, Clock, Heart, User, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PrioridadAnotacion, MotivoFalta } from '../../types';

interface PeticionesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PeticionesModal: React.FC<PeticionesModalProps> = ({ isOpen, onClose }) => {
  const { celulas, asistencias } = useData();
  const [filtroActivo, setFiltroActivo] = useState<'todas' | 'alta' | 'media' | 'baja'>('todas');
  const [tipoFiltro, setTipoFiltro] = useState<'todas' | 'presentes' | 'ausentes'>('todas');

  if (!isOpen) return null;

  // Obtener todas las anotaciones con datos completos
  const obtenerTodasLasAnotaciones = () => {
    const anotaciones: Array<{
      id: string;
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
            celulaId: asistencia.celulaId,
            celulaNombre: celula.name,
            miembroId: miembro.id,
            miembroNombre: miembro.name,
            fecha: asistencia.date,
            presente: true,
            anotacion: miembroAsistencia.anotacionEspecial,
            prioridad: miembroAsistencia.prioridadAnotacion,
            registradoPor: asistencia.registradoPor
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
            anotacionTexto = motivosTexto[miembroAsistencia.motivoFalta];
          }

          anotaciones.push({
            id: `${asistencia.id}-${miembroAsistencia.miembroId}`,
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
            registradoPor: asistencia.registradoPor
          });
        }
      });
    });

    return anotaciones.sort((a, b) => {
      // Primero por prioridad (alta primero)
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
    
    return cumpleFiltroTipo && cumplePrioridad;
  });

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
    alta: anotaciones.filter(a => a.prioridad === 'alta').length,
    media: anotaciones.filter(a => a.prioridad === 'media').length,
    baja: anotaciones.filter(a => a.prioridad === 'baja').length,
    presentes: anotaciones.filter(a => a.presente).length,
    ausentes: anotaciones.filter(a => !a.presente).length
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            Peticiones y Situaciones Importantes
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de contadores */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{contadores.alta}</div>
            <div className="text-sm text-red-700">Prioridad Alta</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{contadores.media}</div>
            <div className="text-sm text-yellow-700">Prioridad Media</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{contadores.baja}</div>
            <div className="text-sm text-green-700">Prioridad Baja</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{contadores.presentes}</div>
            <div className="text-sm text-blue-700">Presentes</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{contadores.ausentes}</div>
            <div className="text-sm text-gray-700">Ausentes</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Prioridad:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroActivo('todas')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filtroActivo === 'todas' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroActivo('alta')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filtroActivo === 'alta' 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                }`}
              >
                Alta ({contadores.alta})
              </button>
              <button
                onClick={() => setFiltroActivo('media')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filtroActivo === 'media' 
                    ? 'bg-yellow-500 text-white border-yellow-500' 
                    : 'bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50'
                }`}
              >
                Media ({contadores.media})
              </button>
              <button
                onClick={() => setFiltroActivo('baja')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filtroActivo === 'baja' 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
                }`}
              >
                Baja ({contadores.baja})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Tipo:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTipoFiltro('todas')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  tipoFiltro === 'todas' 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setTipoFiltro('presentes')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  tipoFiltro === 'presentes' 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
                }`}
              >
                Presentes
              </button>
              <button
                onClick={() => setTipoFiltro('ausentes')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  tipoFiltro === 'ausentes' 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                }`}
              >
                Ausentes
              </button>
            </div>
          </div>
        </div>

        {/* Lista de anotaciones */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {anotacionesFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">
                No hay anotaciones
              </h4>
              <p className="text-gray-500">
                No se encontraron anotaciones con los filtros seleccionados.
              </p>
            </div>
          ) : (
            anotacionesFiltradas.map((anotacion) => (
              <div key={anotacion.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPrioridadColor(anotacion.prioridad)}`}>
                        {getPrioridadIcon(anotacion.prioridad)}
                        {anotacion.prioridad.toUpperCase()}
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        anotacion.presente 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {anotacion.presente ? 'Presente' : 'Ausente'}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {format(anotacion.fecha, 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">{anotacion.miembroNombre}</span>
                      <span className="text-sm text-gray-600">- {anotacion.celulaNombre}</span>
                    </div>
                    
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                      {anotacion.anotacion}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};