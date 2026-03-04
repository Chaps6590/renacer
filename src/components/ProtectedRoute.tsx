import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 flex items-center justify-center">
        <div className="loader-container flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-full h-full bg-white rounded-full shadow-xl p-1.5 border-2 border-blue-100">
              <img src="/icons/logoRenacer.png" alt="Renacer" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          {/* Spinner */}
          <div className="relative w-14 h-14">
            {/* Track */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            {/* Spinning arc */}
            <div className="spin-ring absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-sky-400"></div>
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-blue-700 font-semibold text-base tracking-wide">Cargando...</p>
            <p className="text-blue-400 text-xs mt-1">Iglesia Renacer</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
