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
  const { asistencias, actualizarMotivoFalta, getPendientesAsistencia } = useData();
  const [motivosSeleccionados, setMotivosSeleccionados] = useState<{ [key: string]: { motivo: MotivoFalta; personalizado?: string } }>({});

  if (!isOpen) return null;

  const pendientesLider = getPendientesAsistencia(user?.id || '');

  const motivosFalta: { value: MotivoFalta; label: string }[] = [
    { value: 'trabajo', label: 'Trabajo' },
    { value: 'enfermedad', label: 'Enfermedad' },
    { value: 'vacaciones', label: 'Vacaciones' },
    { value: 'familia', label: 'Asunto familiar' },
    { value: 'viaje', label: 'Viaje' },
    { value: 'sin-motivo', label: 'Sin motivo' },
    { value: 'otro', label: 'Otro (especificar)' }
  ];

  const handleMotivoChange = (asistenciaId: string, miembroId: string, motivo: MotivoFalta) => {
    const key = `${asistenciaId}-${miembroId}`;
    setMotivosSeleccionados({
      ...motivosSeleccionados,
      [key]: { motivo }
    });
  };

  const handleMotivoPersonalizadoChange = (asistenciaId: string, miembroId: string, personalizado: string) => {
    const key = `${asistenciaId}-${miembroId}`;
    setMotivosSeleccionados({
      ...motivosSeleccionados,
      [key]: {
        ...motivosSeleccionados[key],
        personalizado
      }
    });
  };

  const guardarMotivo = (asistenciaId: string, miembroId: string) => {
    const key = `${asistenciaId}-${miembroId}`;
    const motivoData = motivosSeleccionados[key];
    
    if (!motivoData) return;

    actualizarMotivoFalta(
      asistenciaId,
      miembroId,
      motivoData.motivo,
      motivoData.personalizado
    );

    // Limpiar el motivo guardado
    const nuevosMotivos = { ...motivosSeleccionados };
    delete nuevosMotivos[key];
    setMotivosSeleccionados(nuevosMotivos);
  };

  const totalPendientes = pendientesLider.reduce((sum, p) => sum + p.cantidadPendientes, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            Faltas Pendientes de Completar
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {totalPendientes === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              ¡No hay pendientes!
            </h4>
            <p className="text-gray-600">
              Todas las faltas han sido completadas con sus respectivos motivos.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">
                  {totalPendientes} {totalPendientes === 1 ? 'motivo pendiente' : 'motivos pendientes'}
                </h4>
              </div>
              <p className="text-yellow-700 text-sm">
                Completa los motivos de las faltas para tener un registro detallado de la asistencia.
              </p>
            </div>

            {pendientesLider.map((pendiente) => {
              const asistencia = asistencias.find(a => a.id === pendiente.asistenciaId);
              if (!asistencia) return null;

              return (
                <div key={pendiente.asistenciaId} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{pendiente.celulaNombre}</h4>
                      <p className="text-sm text-gray-600">
                        {format(pendiente.fecha, 'EEEE, d MMMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {pendiente.miembrosPendientes.map((miembro) => {
                      const key = `${pendiente.asistenciaId}-${miembro.miembroId}`;
                      const motivoSeleccionado = motivosSeleccionados[key];

                      return (
                        <div key={miembro.miembroId} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-3">{miembro.miembroNombre}</h5>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                                {motivosFalta.map((motivo) => (
                                  <label key={motivo.value} className="flex items-center gap-2 text-sm">
                                    <input
                                      type="radio"
                                      name={`motivo-${key}`}
                                      value={motivo.value}
                                      checked={motivoSeleccionado?.motivo === motivo.value}
                                      onChange={() => handleMotivoChange(pendiente.asistenciaId, miembro.miembroId, motivo.value)}
                                      className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-gray-700">{motivo.label}</span>
                                  </label>
                                ))}
                              </div>

                              {motivoSeleccionado?.motivo === 'otro' && (
                                <textarea
                                  value={motivoSeleccionado.personalizado || ''}
                                  onChange={(e) => handleMotivoPersonalizadoChange(pendiente.asistenciaId, miembro.miembroId, e.target.value)}
                                  placeholder="Especifica el motivo..."
                                  className="w-full p-2 border border-gray-300 rounded-lg resize-none mb-3"
                                  rows={2}
                                />
                              )}
                            </div>

                            <button
                              onClick={() => guardarMotivo(pendiente.asistenciaId, miembro.miembroId)}
                              disabled={!motivoSeleccionado || (motivoSeleccionado.motivo === 'otro' && !motivoSeleccionado.personalizado?.trim())}
                              className="ml-4 btn btn-primary btn-sm flex items-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Guardar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end mt-6">
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