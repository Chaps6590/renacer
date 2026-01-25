import React, { useState, useEffect } from 'react';
import { UserPlus, Users, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { User } from '../../types';

const PastoresAdmin: React.FC = () => {
  const [pastores, setPastores] = useState<User[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', telefono: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchPastores = async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await api.getUsers() as User[];
      setPastores(users.filter((u) => u.role && u.role.toLowerCase() === 'pastor'));
    } catch (err: any) {
      setError('Error al cargar pastores');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPastores();
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
      await api.createUser({ ...form, role: 'PASTOR' });
      setSuccess('Pastor creado exitosamente');
      setForm({ name: '', email: '', password: '', telefono: '' });
      fetchPastores();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al crear pastor');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Pastores</h2>
          <p className="text-gray-600 mt-1">Administra los pastores de la iglesia</p>
        </div>
        <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          <span className="font-semibold">{pastores.length} Pastores</span>
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

      {/* Formulario de agregar pastor */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-800">Agregar Nuevo Pastor</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              placeholder="Ej: Pastor Juan Pérez"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input"
              placeholder="pastor@iglesia.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input pr-10"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              El pastor podrá cambiar su contraseña después de iniciar sesión
            </p>
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="input"
              placeholder="Ej: +54 9 11 ..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            <UserPlus className="w-5 h-5" />
            {loading ? 'Creando Pastor...' : 'Agregar Pastor'}
          </button>
        </form>
      </div>

      {/* Lista de pastores */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Pastores Registrados</h3>

        {loading && !pastores.length ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-gray-600 mt-2">Cargando pastores...</p>
          </div>
        ) : pastores.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay pastores registrados aún</p>
            <p className="text-gray-500 text-sm">Usa el formulario de arriba para agregar el primer pastor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pastores.map((pastor) => (
                  <tr key={pastor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-semibold">
                            {pastor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pastor.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{pastor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{(pastor as any).telefono || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pastor.createdAt ? new Date(pastor.createdAt).toLocaleDateString('es-AR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastoresAdmin;
