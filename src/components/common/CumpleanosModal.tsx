import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Gift } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CumpleanosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CumpleanosModal: React.FC<CumpleanosModalProps> = ({ isOpen, onClose }) => {
  const { celulas } = useData();

  if (!isOpen) return null;

  // Obtener todos los miembros de todas las células
  const miembros = celulas.flatMap(c => c.miembros || []);
  // Filtrar los que tienen fechaNacimiento
  const cumpleanieros = miembros.filter(m => {
    if (!m.fechaNacimiento) return false;
    const d = new Date(m.fechaNacimiento);
    return !isNaN(d.getTime());
  });
  // Ordenar por mes y día
  cumpleanieros.sort((a, b) => {
    const da = a.fechaNacimiento ? new Date(a.fechaNacimiento) : new Date(0);
    const db = b.fechaNacimiento ? new Date(b.fechaNacimiento) : new Date(0);
    if (isNaN(da.getTime()) && isNaN(db.getTime())) return 0;
    if (isNaN(da.getTime())) return 1;
    if (isNaN(db.getTime())) return -1;
    return da.getMonth() !== db.getMonth()
      ? da.getMonth() - db.getMonth()
      : da.getDate() - db.getDate();
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-8 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-yellow-400 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Cumpleaños</h3>
              <p className="text-pink-100 text-xs uppercase tracking-wider font-semibold">Próximos cumpleaños de miembros</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {cumpleanieros.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">No hay cumpleaños registrados</h4>
              <p className="text-gray-500 max-w-sm mx-auto">
                Los cumpleaños de los miembros aparecerán aquí.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {cumpleanieros.map(m => (
                <li key={m.id} className="py-3 flex items-center gap-4">
                  <div className="bg-pink-100 text-pink-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    {m.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{m.name}</div>
                    <div className="text-sm text-gray-500">
                      {m.fechaNacimiento && !isNaN(new Date(m.fechaNacimiento).getTime())
                        ? format(new Date(m.fechaNacimiento + 'T00:00:00Z'), 'd MMMM', { locale: es })
                        : 'Sin fecha'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-6 border-t shrink-0 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors tracking-wide"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
