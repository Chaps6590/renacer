import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Gift } from 'lucide-react';
import { User } from '../../types';

interface CumpleanosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CumpleanosModal: React.FC<CumpleanosModalProps> = ({ isOpen, onClose }) => {
  const { celulas } = useData();
  const { user } = useAuth();
  const [lideres, setLideres] = useState<User[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    
    if (user?.role?.toLowerCase() === 'pastor') {
      // Si es pastor, cargar todos los líderes y colíderes desde la API
      api.getUsers().then((users) => {
        const allUsers = users as User[];
        const lideresYColideres = allUsers.filter((u) => 
          u.role && (u.role.toLowerCase() === 'lider' || u.role.toLowerCase() === 'colider')
        );
        setLideres(lideresYColideres);
      }).catch(error => {
        console.error('Error cargando usuarios:', error);
      });
    } else if (user?.role?.toLowerCase() === 'lider') {
      // Si es líder, usar los datos directamente de la célula (sin llamar a la API)
      const miCelula = celulas.find(c => c.liderId === user.id || c.coLideres.some(col => col.id === user.id));
      if (miCelula) {
        // Construir lista de líderes desde la célula
        const lideresTemp: User[] = [];
        
        // Agregar líder principal
        if (miCelula.liderId && miCelula.liderName) {
          lideresTemp.push({
            id: miCelula.liderId,
            name: miCelula.liderName,
            email: miCelula.liderEmail || '',
            role: 'lider',
            phone: miCelula.liderPhone,
            fechaNacimiento: miCelula.liderFechaNacimiento
          });
        }
        
        // Agregar colíderes (ya tienen fechaNacimiento en sus objetos)
        miCelula.coLideres.forEach(col => {
          lideresTemp.push({
            id: col.id,
            name: col.name,
            email: col.email,
            role: 'colider',
            phone: col.phone,
            fechaNacimiento: col.fechaNacimiento
          });
        });
        
        setLideres(lideresTemp);
      }
    }
  }, [isOpen, user, celulas]);

  if (!isOpen) return null;

  // Obtener la célula del líder si es líder
  const miCelula = user?.role?.toLowerCase() === 'lider' 
    ? celulas.find(c => c.liderId === user.id || c.coLideres.some(col => col.id === user.id))
    : null;

  // Obtener todos los miembros
  let miembros = celulas.flatMap(c => c.miembros || []);
  
  // Si es líder, filtrar solo su célula
  if (user?.role?.toLowerCase() === 'lider' && miCelula) {
    miembros = miCelula.miembros || [];
  }

  // Construir la lista de todas las personas (usando tipo genérico para compatibilidad)
  let todasLasPersonas: Array<{ id: string; name?: string; fechaNacimiento?: string }> = [...miembros];

  // Agregar líderes/colíderes desde los datos cargados de la API
  todasLasPersonas = [...todasLasPersonas, ...lideres];

  // Filtrar los que tienen fechaNacimiento
  const cumpleanieros = todasLasPersonas.filter(m => {
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full my-8 overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
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
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hay cumpleaños registrados</h4>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Los cumpleaños de los miembros aparecerán aquí.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {cumpleanieros.map(m => (
                <li key={m.id} className="py-3 flex items-center gap-4">
                  <div className="bg-pink-100 text-pink-700 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    {m.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 dark:text-gray-100">{m.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {(() => {
                        if (!m.fechaNacimiento) return 'Sin fecha';
                        try {
                          // Extraer solo la parte de fecha (YYYY-MM-DD)
                          const dateStr = m.fechaNacimiento.split(' ')[0].split('T')[0];
                          const [year, month, day] = dateStr.split('-').map(Number);
                          if (!year || !month || !day) throw new Error('Invalid date');
                          const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                          return `${day} ${meses[month - 1]}`;
                        } catch {
                          return 'Sin fecha';
                        }
                      })()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-6 border-t shrink-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors tracking-wide"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
