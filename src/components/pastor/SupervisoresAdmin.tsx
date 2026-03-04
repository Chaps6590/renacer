import React, { useState, useEffect } from 'react';
import { UserPlus, Users, CheckCircle, XCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { User, Celula } from '../../types';

interface SupervisoresAdminProps {
  celulas: Celula[];
}

const SupervisoresAdmin: React.FC<SupervisoresAdminProps> = ({ celulas }) => {
  const [supervisores, setSupervisores] = useState<User[]>([]);
  const [lideresDisponibles, setLideresDisponibles] = useState<User[]>([]);
  const [liderParaConvertir, setLiderParaConvertir] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: 'Renacer', telefono: '', fechaNacimiento: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchSupervisores = async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await api.getUsers() as User[];
      setSupervisores(users.filter((u) => u.role && u.role.toLowerCase() === 'supervisor'));
      setLideresDisponibles(users.filter((u) => u.role && u.role.toLowerCase() === 'lider'));
    } catch (err: any) {
      setError('Error al cargar supervisores');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSupervisores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.createUser({ ...form, role: 'SUPERVISOR' });
      setSuccess('Supervisor creado exitosamente');
      setForm({ name: '', email: '', password: 'Renacer', telefono: '', fechaNacimiento: '' });
      fetchSupervisores();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al crear supervisor');
    }
    setLoading(false);
  };

  const handleConvertirLiderASupervisor = async () => {
    if (!liderParaConvertir) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.updateUser(liderParaConvertir, { role: 'SUPERVISOR' });
      setSuccess('Líder convertido a supervisor exitosamente');
      setLiderParaConvertir('');
      await fetchSupervisores();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al convertir líder a supervisor');
    }
    setLoading(false);
  };

  const handleAsignarCelula = async (supervisorId: string, celulaId: string) => {
    try {
      await api.actualizarCelula(celulaId, { supervisorId });
      setSuccess('Célula asignada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      // Recargar para actualizar la vista
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Error al asignar célula');
    }
  };

  const handleDesasignarCelula = async (celulaId: string) => {
    try {
      await api.actualizarCelula(celulaId, { supervisorId: null });
      setSuccess('Célula desasignada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
      // Recargar para actualizar la vista
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Error al desasignar célula');
    }
  };

  // Agrupar células por supervisor
  const getCelulasBySupervisor = (supervisorId: string) => {
    return celulas.filter(c => c.supervisorId === supervisorId);
  };

  const celulaSinSupervisor = celulas.filter(c => !c.supervisorId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Supervisores</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra los supervisores de células</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">{supervisores.length} Supervisores</span>
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Formulario de agregar supervisor */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Agregar Nuevo Supervisor</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre Completo *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input"
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo Electrónico *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="supervisor@iglesia.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input pr-10"
                  placeholder="Por defecto: Renacer"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Contraseña por defecto: "Renacer". El supervisor puede cambiarla desde su perfil.</p>
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="input"
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            <div>
              <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                id="fechaNacimiento"
                type="date"
                name="fechaNacimiento"
                value={form.fechaNacimiento}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full md:w-auto"
          >
            {loading ? 'Creando...' : 'Crear Supervisor'}
          </button>
        </form>
      </div>

      {/* Lista de supervisores */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Convertir Líder Existente</h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Puedes convertir un líder ya asignado a célula para que también actúe como supervisor.
        </p>

        {lideresDisponibles.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay líderes disponibles para convertir.</p>
        ) : (
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selecciona un líder
              </label>
              <select
                value={liderParaConvertir}
                onChange={(e) => setLiderParaConvertir(e.target.value)}
                className="input"
              >
                <option value="">Seleccionar líder...</option>
                {lideresDisponibles.map((lider) => {
                  const celulaAsignada = celulas.find(c => c.liderId === lider.id);
                  return (
                    <option key={lider.id} value={lider.id}>
                      {lider.name} {celulaAsignada ? `- ${celulaAsignada.name}` : '- Sin célula asignada'}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="button"
              disabled={loading || !liderParaConvertir}
              onClick={handleConvertirLiderASupervisor}
              className="btn btn-primary md:w-auto"
            >
              Convertir a Supervisor
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Supervisores Activos</h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando...</div>
        ) : supervisores.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay supervisores creados aún
          </div>
        ) : (
          <div className="space-y-4">
            {supervisores.map((supervisor) => {
              const celulasAsignadas = getCelulasBySupervisor(supervisor.id);
              
              return (
                <div
                  key={supervisor.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{supervisor.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{supervisor.email}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Células supervisadas ({celulasAsignadas.length}):
                        </p>
                        {celulasAsignadas.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            No tiene células asignadas
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {celulasAsignadas.map((celula) => (
                              <div
                                key={celula.id}
                                className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg"
                              >
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  {celula.name}
                                </span>
                                <button
                                  onClick={() => handleDesasignarCelula(celula.id)}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                                  title="Desasignar"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selector para asignar nuevas células */}
                    {celulaSinSupervisor.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Asignar célula:
                        </label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAsignarCelula(supervisor.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="input min-w-[200px]"
                        >
                          <option value="">Seleccionar...</option>
                          {celulaSinSupervisor.map((celula) => (
                            <option key={celula.id} value={celula.id}>
                              {celula.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Células sin supervisor */}
      {celulaSinSupervisor.length > 0 && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
          <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Células sin supervisor ({celulaSinSupervisor.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {celulaSinSupervisor.map((celula) => (
              <div
                key={celula.id}
                className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-yellow-300 dark:border-yellow-700"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {celula.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisoresAdmin;
