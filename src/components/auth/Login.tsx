import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ExternalLink } from 'lucide-react';
import logo from '../../assets/images/logoRenacer2.png';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'session-expired') {
      setError('Tu sesión venció. Volvé a iniciar sesión.');
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Credenciales inválidas. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">

      {/* ── Banner de migración ───────────────────────────────────────── */}
      <div className="fixed top-0 inset-x-0 z-50">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-3 shadow-lg">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm font-semibold mb-0.5">
              🎉 ¡Renacer se mudó a una nueva plataforma!
            </p>
            <p className="text-xs text-blue-200 mb-2">
              Ya podés acceder con tus mismos datos en nuestra nueva app Kairos.
            </p>
            <a
              href="https://kairos.chapstech.cloud/login/renacer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white text-blue-700 font-bold text-xs px-4 py-2 rounded-full shadow hover:bg-blue-50 transition"
            >
              Ir a la nueva app
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pt-20">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-sky-200 dark:bg-sky-900 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-300 dark:bg-blue-900 rounded-full opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-sky-400 dark:bg-sky-800 rounded-full opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Main Container */}
      <div className="relative bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700 w-full max-w-md overflow-hidden mt-20">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 to-sky-600 px-8 pt-12 pb-8 text-center">
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-8 w-2 h-2 bg-white dark:bg-gray-800 rounded-full"></div>
            <div className="absolute top-8 left-16 w-1 h-1 bg-white dark:bg-gray-800 rounded-full"></div>
            <div className="absolute top-6 right-12 w-2 h-2 bg-white dark:bg-gray-800 rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-1 h-1 bg-white dark:bg-gray-800 rounded-full"></div>
            <div className="absolute bottom-12 left-12 w-2 h-2 bg-white dark:bg-gray-800 rounded-full"></div>
          </div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, index) => (
              <span
                key={index}
                className="login-particle"
                style={{
                  left: `${8 + ((index * 8) % 84)}%`,
                  top: `${12 + ((index * 13) % 72)}%`,
                  animationDelay: `${(index % 6) * 0.5}s`
                }}
              />
            ))}
          </div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-32 h-32 mb-6 relative">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-white/35 rounded-full blur-xl"></div>
              {/* Main container */}
              <div className="relative w-full h-full bg-white/20 backdrop-blur-sm rounded-full shadow-2xl p-1.5 border-2 border-white/50 ring-2 ring-white/35">
                <img 
                  src={logo} 
                  alt="Logo Iglesia Renacer" 
                  className="w-full h-full object-contain rounded-full drop-shadow-[0_4px_14px_rgba(255,255,255,0.35)]"
                />
              </div>
              {/* Subtle shine effect */}
              <div className="absolute top-6 left-8 w-8 h-8 bg-white/20 rounded-full blur-sm"></div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 tracking-wide">Favor y Influencia</h1>
            <p className="verse-animate verse-glow text-blue-100 text-base leading-relaxed px-4 font-medium italic">
              "Entonces alcanzarás el favor de Dios y tu influencia será determinada entre los hombres"
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Bienvenido de vuelta</h2>
            <p className="text-gray-600 dark:text-gray-400">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-400 transition duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-r-lg animate-shake">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-semibold py-4 px-6 rounded-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition duration-300" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
