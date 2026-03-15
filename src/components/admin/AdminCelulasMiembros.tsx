import React, { useMemo, useState } from 'react';
import { Users, Building2, Search, Phone, Mail, CalendarDays } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const formatDate = (value?: string | Date) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-AR');
};

const AdminCelulasMiembros: React.FC = () => {
  const { celulas, loading } = useData();
  const [search, setSearch] = useState('');

  const normalizedSearch = search.trim().toLowerCase();

  const celulasFiltradas = useMemo(() => {
    if (!normalizedSearch) return celulas;

    return celulas.filter((celula) => {
      const miembrosTexto = celula.miembros
        .map((m) => `${m.name} ${m.email || ''} ${m.phone || ''}`.toLowerCase())
        .join(' ');

      return (
        celula.name.toLowerCase().includes(normalizedSearch) ||
        celula.liderName.toLowerCase().includes(normalizedSearch) ||
        (celula.supervisorName || '').toLowerCase().includes(normalizedSearch) ||
        miembrosTexto.includes(normalizedSearch)
      );
    });
  }, [celulas, normalizedSearch]);

  const totalMiembros = useMemo(() => celulasFiltradas.reduce((acc, celula) => acc + celula.miembros.length, 0), [celulasFiltradas]);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Células y Miembros</h2>
            <p className="text-gray-600 dark:text-gray-400">Vista global para administración y seguimiento.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="font-semibold">{celulasFiltradas.length} Células</span>
            </div>
            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{totalMiembros} Miembros</span>
            </div>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Buscar por célula, líder, supervisor o miembro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando células...</p>
        </div>
      ) : celulasFiltradas.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">No hay resultados para ese filtro.</p>
        </div>
      ) : (
        celulasFiltradas.map((celula) => (
          <div key={celula.id} className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{celula.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Líder: {celula.liderName} | Día: {celula.diaSemana} | Horario: {celula.horario}
                </p>
                {celula.supervisorName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Supervisor: {celula.supervisorName}</p>
                )}
              </div>

              <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700 self-start">
                {celula.miembros.length} miembros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Contacto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Nacimiento</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Registro</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {celula.miembros.map((miembro) => (
                    <tr key={miembro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">{miembro.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 uppercase">{miembro.rolCelula}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <span>{miembro.phone || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span>{miembro.email || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 text-gray-500" />
                          <span>{formatDate(miembro.fechaNacimiento)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {miembro.isRegistered ? (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Registrado</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">No registrado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminCelulasMiembros;
