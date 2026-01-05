import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Church, Search } from 'lucide-react';

// Mock de líderes precargados - esto vendrá de la API
const mockPreloadedLideres = [
  { id: '2', name: 'Juan Pérez' },
  { id: '3', name: 'María González' },
  { id: '4', name: 'Carlos Rodríguez' },
];

export const Register: React.FC = () => {
  const [step, setStep] = useState<'search' | 'validate' | 'form'>('search');
  const [searchName, setSearchName] = useState('');
  const [foundLider, setFoundLider] = useState<typeof mockPreloadedLideres[0] | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSearch = () => {
    // TODO: Buscar en la API
    const lider = mockPreloadedLideres.find(
      l => l.name.toLowerCase().includes(searchName.toLowerCase())
    );

    if (lider) {
      setFoundLider(lider);
      setStep('validate');
      setError('');
    } else {
      setError('No se encontró un líder con ese nombre. Contacta al pastor.');
    }
  };

  const handleConfirmIdentity = () => {
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: foundLider?.name || '',
        email: formData.email,
        password: formData.password,
        role: 'lider',
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Error al registrarse. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-600 p-4 rounded-full mb-4">
            <Church className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Registro de Líder</h1>
          <p className="text-gray-600 mt-2">Completa tu registro</p>
        </div>

        {step === 'search' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-2">
                Busca tu nombre
              </label>
              <div className="flex gap-2">
                <input
                  id="searchName"
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="input flex-1"
                  placeholder="Ingresa tu nombre"
                />
                <button
                  onClick={handleSearch}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Buscar
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={() => navigate('/login')}
              className="text-primary-600 hover:text-primary-700 font-medium w-full text-center"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}

        {step === 'validate' && foundLider && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">¡Líder encontrado!</h2>
              <p className="text-gray-600 mb-4">¿Eres tú?</p>
              <p className="text-2xl font-bold text-primary-600">{foundLider.name}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleConfirmIdentity}
                className="btn btn-primary flex-1"
              >
                Sí, soy yo
              </button>
              <button
                onClick={() => {
                  setStep('search');
                  setFoundLider(null);
                  setSearchName('');
                }}
                className="btn btn-secondary flex-1"
              >
                No soy yo
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Nombre:</strong> {foundLider?.name}
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (opcional)
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input"
                placeholder="Repite tu contraseña"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? 'Registrando...' : 'Completar Registro'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
