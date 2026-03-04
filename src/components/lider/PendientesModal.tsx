import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { MotivoFalta } from '../../types';
import { AlertCircle, Save, X, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PendientesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PendientesModal: React.FC<PendientesModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { actualizarMotivoFalta, getPendientesAsistencia } = useData();
  const [motivosSeleccionados, setMotivosSeleccionados] = useState<{
    [key: string]: {
      motivo?: MotivoFalta;
      personalizado?: string;
      anotacionEspecial?: string;
      prioridad?: string;
    }
  }>({});

  if (!isOpen) return null;

  const pendientesLider = getPendientesAsistencia(user?.id || '');

  const motivosFalta: { value: MotivoFalta; label: string }[] = [
    { value: 'trabajo', label: 'Trabajo' },
    { value: 'enfermedad', label: 'Enfermedad' },
    { value: 'vacaciones', label: 'Vacaciones' },
    { value: 'familia', label: 'Asunto familiar' },
    { value: 'viaje', label: 'Viaje' },
    { value: 'otro', label: 'Otro (especificar)' }
  ];

  const handleMotivoChange = (asistenciaId: string, miembroId: string, motivo: MotivoFalta) => {
    const key = `${asistenciaId}-${miembroId}`;
    setMotivosSeleccionados(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        motivo
      }
    }));
  };

  const handleAnotacionChange = (asistenciaId: string, miembroId: string, anotacionEspecial: string) => {
    const key = `${asistenciaId}-${miembroId}`;
    setMotivosSeleccionados(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        anotacionEspecial
      }
    }));
  };

  const handlePrioridadChange = (asistenciaId: string, miembroId: string, prioridad: string) => {
    const key = `${asistenciaId}-${miembroId}`;
    setMotivosSeleccionados(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        prioridad
      }
    }));
  };

  const guardarMotivo = (asistenciaId: string, miembroId: string) => {
    const key = `${asistenciaId}-${miembroId}`;
    const motivoData = motivosSeleccionados[key];

    if (!motivoData || !motivoData.motivo) return;

    // Si no seleccionó prioridad, establecer 'media' por defecto para que se visualice como petición
    const prioridad = motivoData.prioridad || 'media';

    actualizarMotivoFalta(
      asistenciaId,
      miembroId,
      motivoData.motivo,
      motivoData.personalizado,
      motivoData.anotacionEspecial,
      prioridad
    );

    // Limpiar el motivo guardado
    const nuevosMotivos = { ...motivosSeleccionados };
    delete nuevosMotivos[key];
    setMotivosSeleccionados(nuevosMotivos);
  };

  const totalPendientes = pendientesLider.reduce((sum, p) => sum + p.cantidadPendientes, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full my-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            Faltas Pendientes de Seguimiento
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {totalPendientes === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Célula al día!
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              No tienes motivos de falta pendientes por completar.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <h4 className="font-bold text-yellow-800 text-lg">
                  {totalPendientes} Seguimientos pendientes
                </h4>
              </div>
              <p className="text-yellow-700">
                Es fundamental completar el motivo por el cual los hermanos no pudieron asistir para brindarles el cuidado necesario.
              </p>
            </div>

            {pendientesLider.map((pendiente) => (
              <div key={pendiente.asistenciaId} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">{pendiente.celulaNombre}</span>
                      <span className="mx-2 text-gray-400">|</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {format(new Date(pendiente.fecha), 'EEEE, d MMMM yyyy', { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {pendiente.miembrosPendientes.map((miembro) => {
                    const key = `${pendiente.asistenciaId}-${miembro.miembroId}`;
                    const motivoSeleccionado = motivosSeleccionados[key];

                    return (
                      <div key={miembro.miembroId} className="bg-white dark:bg-gray-800 border-2 border-red-100 rounded-xl p-5 hover:border-red-200 transition-colors">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                                {miembro.miembroNombre.charAt(0)}
                              </div>
                              <h5 className="font-bold text-gray-900 dark:text-white text-lg">{miembro.miembroNombre}</h5>
                            </div>

                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">¿Por qué faltó?</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {motivosFalta.map((motivo) => (
                                  <label key={motivo.value} className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all ${motivoSeleccionado?.motivo === motivo.value
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                    }`}>
                                    <input
                                      type="radio"
                                      name={`motivo-${key}`}
                                      value={motivo.value}
                                      checked={motivoSeleccionado?.motivo === motivo.value}
                                      onChange={() => handleMotivoChange(pendiente.asistenciaId, miembro.miembroId, motivo.value)}
                                      className="sr-only"
                                    />
                                    <span className="text-xs font-bold leading-tight text-center">{motivo.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4">
                              {/* Mostrar textarea solo cuando selecciona 'otro' */}
                              {motivoSeleccionado?.motivo === 'otro' && (
                                <div>
                                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Especificar Motivo *</p>
                                  <textarea
                                    value={motivoSeleccionado?.anotacionEspecial || ''}
                                    onChange={(e) => handleAnotacionChange(pendiente.asistenciaId, miembro.miembroId, e.target.value)}
                                    placeholder="Especifica cuál fue el motivo de la ausencia..."
                                    className={`w-full p-3 border-2 rounded-xl resize-none focus:border-blue-500 focus:ring-0 transition-all text-sm text-gray-900 dark:text-white font-bold placeholder-gray-400 bg-white dark:bg-gray-800 ${
                                      !motivoSeleccionado?.anotacionEspecial?.trim() ? 'border-red-200 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                    rows={2}
                                  />
                                </div>
                              )}

                              <div>
                                <div className="flex flex-wrap items-center gap-4 mb-2">
                                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Prioridad:</span>
                                  {(['alta', 'media', 'baja']).map(prioridad => (
                                    <label key={prioridad} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all ${motivoSeleccionado?.prioridad === prioridad
                                      ? (prioridad === 'alta' ? 'bg-red-500 border-red-500 text-white' :
                                        prioridad === 'media' ? 'bg-yellow-500 border-yellow-500 text-white' :
                                          'bg-green-500 border-green-500 text-white')
                                      : 'bg-gray-100 border-gray-200 text-gray-600'
                                      }`}>
                                      <input
                                        type="radio"
                                        name={`prioridad-${key}`}
                                        checked={motivoSeleccionado?.prioridad === prioridad}
                                        onChange={() => handlePrioridadChange(pendiente.asistenciaId, miembro.miembroId, prioridad)}
                                        className="sr-only"
                                      />
                                      <span className="text-xs font-bold capitalize">{prioridad}</span>
                                    </label>
                                  ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {!motivoSeleccionado?.prioridad && '⚠️ Se asignará prioridad media para seguimiento pastoral'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex lg:flex-col items-center justify-center lg:border-l lg:pl-6 border-gray-100">
                            <button
                              onClick={() => guardarMotivo(pendiente.asistenciaId, miembro.miembroId)}
                              disabled={!motivoSeleccionado?.motivo || (motivoSeleccionado?.motivo === 'otro' && !motivoSeleccionado?.anotacionEspecial?.trim())}
                              className="w-full lg:w-32 group inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl transition duration-300 shadow-md hover:shadow-lg disabled:from-gray-400 disabled:to-gray-500"
                            >
                              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              Continuar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};