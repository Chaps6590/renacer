import React, { useState } from 'react';
import { Celula, AsistenciaRecord } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Check, X, Save } from 'lucide-react';
import { format } from 'date-fns';

interface AsistenciaModalProps {
  celula: Celula;
  onClose: () => void;
}

export const AsistenciaModal: React.FC<AsistenciaModalProps> = ({ celula, onClose }) => {
  const { user } = useAuth();
  const { registrarAsistencia } = useData();
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [asistencias, setAsistencias] = useState<{ [key: string]: boolean }>(
    celula.miembros.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );

  const handleToggleAsistencia = (miembroId: string) => {
    setAsistencias({
      ...asistencias,
      [miembroId]: !asistencias[miembroId],
    });
  };

  const handleGuardar = () => {
    const presentes = Object.entries(asistencias)
      .filter(([_, presente]) => presente)
      .map(([id]) => id);
    
    const ausentes = Object.entries(asistencias)
      .filter(([_, presente]) => !presente)
      .map(([id]) => id);

    const record: AsistenciaRecord = {
      id: Date.now().toString(),
      celulaId: celula.id,
      date: new Date(fecha),
      miembrosPresentes: presentes,
      miembrosAusentes: ausentes,
      totalPresentes: presentes.length,
      totalAusentes: ausentes.length,
      registradoPor: user?.id || '',
    };

    registrarAsistencia(record);
    onClose();
    alert('¡Asistencia registrada exitosamente!');
  };

  const totalPresentes = Object.values(asistencias).filter(Boolean).length;
  const totalAusentes = celula.miembros.length - totalPresentes;

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        </div>

        <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
          {celula.miembros.map((miembro) => (
            <div
              key={miembro.id}
              onClick={() => handleToggleAsistencia(miembro.id)}
              className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                asistencias[miembro.id]
                  ? 'bg-green-50 border-2 border-green-300'
                  : 'bg-red-50 border-2 border-red-300'
              }`}
            >
              <div>
                <p className="font-medium text-gray-900">{miembro.name}</p>
                {miembro.phone && (
                  <p className="text-sm text-gray-600">{miembro.phone}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {asistencias[miembro.id] ? (
                  <>
                    <Check className="w-6 h-6 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Presente</span>
                  </>
                ) : (
                  <>
                    <X className="w-6 h-6 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Ausente</span>
                  </>
                )}
              </div>
            </div>
          ))}
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
