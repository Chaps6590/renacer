import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Users, BarChart3, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">Renacer</h1>
            <span className="ml-4 text-gray-600">| {user?.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
              {user?.role}
            </span>
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
  );
};
