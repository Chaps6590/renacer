import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { LogOut, User, Moon, Sun, ArrowLeftRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PerfilModal } from '../common/PerfilModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { celulas } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPerfil, setShowPerfil] = useState(false);

  // Detectar si el usuario es supervisor Y también líder de una célula
  const isSupervisor = user?.role?.toLowerCase() === 'supervisor';
  const esLiderDeCelula = celulas.some(c => 
    c.liderId === user?.id || c.coLideres.some(col => col.id === user?.id)
  );
  const tieneDualRole = isSupervisor && esLiderDeCelula;

  // Debug: mostrar información en consola
  useEffect(() => {
    if (isSupervisor) {
      console.log('🔍 Debug Dual Role:');
      console.log('  - Es supervisor:', isSupervisor);
      console.log('  - User ID:', user?.id);
      console.log('  - Total células:', celulas.length);
      console.log('  - Es líder de célula:', esLiderDeCelula);
      console.log('  - Tiene dual role:', tieneDualRole);
      
      // Mostrar detalles de células
      celulas.forEach(c => {
        const esLider = c.liderId === user?.id;
        const esColider = c.coLideres.some(col => col.id === user?.id);
        if (esLider || esColider) {
          console.log(`  ✅ Célula "${c.name}": ${esLider ? 'Líder' : 'Colíder'}`);
        }
      });
    }
  }, [isSupervisor, esLiderDeCelula, tieneDualRole, celulas.length]);

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

  const cambiarVista = () => {
    // Si está en /supervisor, ir a /lider. Si está en /lider, ir a /supervisor
    if (location.pathname === '/supervisor') {
      navigate('/lider');
    } else {
      navigate('/supervisor');
    }
  };

  const getVistaActual = () => {
    if (location.pathname === '/lider') return 'Líder';
    if (location.pathname === '/supervisor') return 'Supervisor';
    return 'Supervisor';
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
              {tieneDualRole && (
                <button 
                  onClick={cambiarVista}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
                  title="Cambiar vista"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Vista: {getVistaActual()}
                </button>
              )}
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
          <div className="sm:hidden grid gap-2 pb-2" style={{ gridTemplateColumns: tieneDualRole ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)' }}>
            {tieneDualRole && (
              <button 
                onClick={cambiarVista}
                className="btn btn-secondary flex items-center justify-center gap-1 text-xs"
                title="Cambiar vista"
              >
                <ArrowLeftRight className="w-3 h-3" />
                {getVistaActual()}
              </button>
            )}
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
