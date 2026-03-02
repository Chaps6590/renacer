import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PerfilModal } from '../common/PerfilModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPerfil, setShowPerfil] = useState(false);

  const getRolLabel = (role?: string) => {
    const map: Record<string, string> = {
      timoteo: 'Líder Col.',
      colider: 'Co-Líder',
      lider: 'Líder',
      pastor: 'Pastor',
      supervisor: 'Supervisor',
      admin: 'Admin',
    };
    return map[role?.toLowerCase() ?? ''] ?? role ?? '';
  };
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* Fila superior: logo + nombre + badge */}
          <div className="flex items-center justify-between h-12 sm:h-16">
            <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-primary-600 dark:text-primary-400 shrink-0">Renacer</h1>
              <span className="text-gray-400 dark:text-gray-500 shrink-0 text-sm">|</span>
              <span className="text-xs sm:text-base text-gray-600 dark:text-gray-300 truncate">{user?.name}</span>
              <span className="shrink-0 px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium ml-1">
                {getRolLabel(user?.role)}
              </span>
            </div>

            {/* Solo en desktop: badge + botones en la misma fila */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {getRolLabel(user?.role)}
              </span>
              <button onClick={toggleDarkMode} className="btn btn-secondary flex items-center gap-2 text-sm" title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}>
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>Tema</span>
              </button>
              <button onClick={() => setShowPerfil(true)} className="btn btn-secondary flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                Perfil
              </button>
              <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2 text-sm">
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>

          {/* Fila inferior solo en móvil: 3 botones con texto */}
          <div className="sm:hidden grid grid-cols-3 gap-2 pb-2">
            <button onClick={toggleDarkMode} className="btn btn-secondary flex items-center justify-center gap-2 text-sm">
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              Tema
            </button>
            <button onClick={() => setShowPerfil(true)} className="btn btn-secondary flex items-center justify-center gap-2 text-sm">
              <User className="w-4 h-4" />
              Perfil
            </button>
            <button onClick={handleLogout} className="btn btn-secondary flex items-center justify-center gap-2 text-sm">
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>

        </div>
      </nav>

      {showPerfil && <PerfilModal onClose={() => setShowPerfil(false)} />}
    </>
  );
};
