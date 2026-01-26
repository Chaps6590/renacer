import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Gift } from 'lucide-react';
import { CumpleanosModal } from '../common/CumpleanosModal';
import { useNavigate } from 'react-router-dom';
import { PerfilModal } from '../common/PerfilModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPerfil, setShowPerfil] = useState(false);
  const [showCumple, setShowCumple] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Renacer</h1>
              <span className="ml-4 text-gray-600">| {user?.name}</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCumple(true)}
                className="btn btn-secondary flex items-center gap-2"
                title="Cumpleaños"
              >
                <Gift className="w-4 h-4 text-pink-500" />
                Cumpleaños
              </button>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
                {user?.role}
              </span>
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
      {showCumple && <CumpleanosModal isOpen={showCumple} onClose={() => setShowCumple(false)} />}
    </>
  );
};
