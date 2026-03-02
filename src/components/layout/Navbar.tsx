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
          <div className="h-14 sm:h-16 flex items-center justify-between gap-2 overflow-hidden">
            {/* Izquierda: logo + nombre */}
            <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-primary-600 dark:text-primary-400 shrink-0">Renacer</h1>
              <span className="text-gray-400 dark:text-gray-500 shrink-0 text-sm">|</span>
              <span className="text-xs sm:text-base text-gray-600 dark:text-gray-300 truncate">{user?.name}</span>
              <span className="shrink-0 px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                {getRolLabel(user?.role)}
              </span>
            </div>

            {/* Derecha: acciones — solo íconos en móvil */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <span className="hidden sm:inline-flex px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {getRolLabel(user?.role)}
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 sm:px-3 sm:py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowPerfil(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Perfil</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showPerfil && <PerfilModal onClose={() => setShowPerfil(false)} />}
    </>
  );
};
