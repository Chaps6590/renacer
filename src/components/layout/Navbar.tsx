import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PerfilModal } from '../common/PerfilModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPerfil, setShowPerfil] = useState(false);
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Renacer</h1>
              <span className="ml-4 text-gray-600 dark:text-gray-300">| {user?.name}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium capitalize">
                {user?.role}
              </span>
              <button
                onClick={toggleDarkMode}
                className="btn btn-secondary flex items-center gap-2"
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowPerfil(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Perfil
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center gap-2"
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
