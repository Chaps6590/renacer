import React, { useState } from 'react';
import { Celula, AsistenciaRecord, MiembroAsistencia, PrioridadAnotacion } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Check, X, Save, AlertCircle, MessageCircle, Flag } from 'lucide-react';
import { format } from 'date-fns';

interface AsistenciaModalProps {
  celula: Celula;
  onClose: () => void;
}

export const AsistenciaModal: React.FC<AsistenciaModalProps> = ({ celula, onClose }) => {
  const { user } = useAuth();
  const { registrarAsistencia } = useData();
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [miembrosAsistencia, setMiembrosAsistencia] = useState<{ [key: string]: MiembroAsistencia }>(
    celula.miembros.reduce((acc, m) => ({
      ...acc,
      [m.id]: {
        miembroId: m.id,
        presente: true,
        motivoCompletado: true,
        anotacionEspecial: '',
        prioridadAnotacion: 'baja' as PrioridadAnotacion
      }
    }), {})
  );
  const [mostrandoDetalles, setMostrandoDetalles] = useState<string | null>(null);

  const handleToggleAsistencia = (miembroId: string) => {
    setMiembrosAsistencia({
      ...miembrosAsistencia,
      [miembroId]: {
        ...miembrosAsistencia[miembroId],
        presente: !miembrosAsistencia[miembroId].presente,
        motivoCompletado: !miembrosAsistencia[miembroId].presente ? false : true,
        motivoFalta: undefined,
        motivoPersonalizado: undefined
      }
    });
  };
  
  const handleAnotacionEspecial = (miembroId: string, anotacion: string, prioridad: PrioridadAnotacion) => {
    setMiembrosAsistencia({
      ...miembrosAsistencia,
      [miembroId]: {
        ...miembrosAsistencia[miembroId],
        anotacionEspecial: anotacion,
        prioridadAnotacion: prioridad
      }
    });
  };

  const handleGuardar = () => {
    const miembros = Object.values(miembrosAsistencia);
    const presentes = miembros.filter(m => m.presente).length;
    const ausentes = miembros.filter(m => !m.presente).length;
    const pendientesCompletar = miembros.filter(m => !m.presente && !m.motivoCompletado).length;

    const record: AsistenciaRecord = {
      id: Date.now().toString(),
      celulaId: celula.id,
      date: new Date(fecha),
      miembros,
      totalPresentes: presentes,
      totalAusentes: ausentes,
      pendientesCompletar,
      registradoPor: user?.id || '',
      fechaRegistro: new Date(),
      completado: pendientesCompletar === 0
    };

    registrarAsistencia(record);
    onClose();
    alert(pendientesCompletar > 0 
      ? `¡Asistencia registrada! Quedan ${pendientesCompletar} motivos de falta pendientes por completar.`
      : '¡Asistencia registrada exitosamente!');
  };

  const totalPresentes = Object.values(miembrosAsistencia).filter(m => m.presente).length;
  const totalAusentes = celula.miembros.length - totalPresentes;
  const pendientesMotivo = Object.values(miembrosAsistencia).filter(m => !m.presente && !m.motivoCompletado).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
        <h3 className="text-2xl font-bold mb-6">Registrar Asistencia</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de la Reunión
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="input max-w-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-primary-50 border border-primary-200">
            <p className="text-sm text-gray-600 mb-1">Total Miembros</p>
            <p className="text-2xl font-bold text-primary-700">{celula.miembros.length}</p>
          </div>
          <div className="card bg-green-50 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Presentes</p>
            <p className="text-2xl font-bold text-green-700">{totalPresentes}</p>
          </div>
          <div className="card bg-red-50 border border-red-200">
            <p className="text-sm text-gray-600 mb-1">Ausentes</p>
            <p className="text-2xl font-bold text-red-700">{totalAusentes}</p>
          </div>
          <div className="card bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-700">{pendientesMotivo}</p>
          </div>
        </div>

        <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
          {celula.miembros.map((miembro) => {
            const asistencia = miembrosAsistencia[miembro.id];
            return (
              <div key={miembro.id} className="border rounded-lg overflow-hidden">
                {/* Fila principal */}
                <div
                  onClick={() => handleToggleAsistencia(miembro.id)}
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                    asistencia.presente
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{miembro.name}</p>
                    {miembro.phone && (
                      <p className="text-sm text-gray-600">{miembro.phone}</p>
                    )}
                    {asistencia.anotacionEspecial && (
                      <p className="text-sm text-blue-600 font-medium mt-1">
                        <Flag className={`w-3 h-3 inline mr-1 ${
                          asistencia.prioridadAnotacion === 'alta' ? 'text-red-500' :
                          asistencia.prioridadAnotacion === 'media' ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                        {asistencia.anotacionEspecial}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {asistencia.presente ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMostrandoDetalles(mostrandoDetalles === miembro.id ? null : miembro.id);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2">
                          <Check className="w-6 h-6 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Presente</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {!asistencia.motivoCompletado && (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        )}
                        <div className="flex items-center gap-2">
                          <X className="w-6 h-6 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Ausente</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Panel de detalles expandible */}
                {mostrandoDetalles === miembro.id && asistencia.presente && (
                  <div className="p-4 bg-blue-50 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Anotación Especial</h4>
                    <div className="space-y-3">
                      <textarea
                        value={asistencia.anotacionEspecial || ''}
                        onChange={(e) => handleAnotacionEspecial(miembro.id, e.target.value, asistencia.prioridadAnotacion!)}
                        placeholder="Ej: Necesita oración por familiar internado, petición especial, etc."
                        className="w-full p-2 border rounded-lg resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <label className="text-sm font-medium text-gray-700">Prioridad:</label>
                        {(['alta', 'media', 'baja'] as PrioridadAnotacion[]).map(prioridad => (
                          <label key={prioridad} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name={`prioridad-${miembro.id}`}
                              checked={asistencia.prioridadAnotacion === prioridad}
                              onChange={() => handleAnotacionEspecial(miembro.id, asistencia.anotacionEspecial || '', prioridad)}
                              className="w-3 h-3"
                            />
                            <span className={`capitalize ${
                              prioridad === 'alta' ? 'text-red-600' :
                              prioridad === 'media' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {prioridad}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {celula.miembros.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            No hay miembros para tomar asistencia. Agrega miembros primero.
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleGuardar}
            disabled={celula.miembros.length === 0}
            className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Guardar Asistencia
            {pendientesMotivo > 0 && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                {pendientesMotivo} pendientes
              </span>
            )}
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
