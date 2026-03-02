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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center justify-between min-w-0">
              <div className="flex items-center min-w-0">
                <h1 className="text-2xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">Renacer</h1>
                <span className="ml-2 sm:ml-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 truncate">| {user?.name}</span>
              </div>

              <span className="sm:hidden px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium capitalize ml-2">
                {getRolLabel(user?.role)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
              <span className="hidden sm:inline-flex px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium capitalize">
                {getRolLabel(user?.role)}
              </span>
              <button
                onClick={toggleDarkMode}
                className="btn btn-secondary flex items-center justify-center gap-2 text-sm"
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="hidden sm:inline">Tema</span>
              </button>
              <button
                onClick={() => setShowPerfil(true)}
                className="btn btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                <User className="w-4 h-4" />
                Perfil
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showPerfil && <PerfilModal onClose={() => setShowPerfil(false)} />}
    </>
  );
};
