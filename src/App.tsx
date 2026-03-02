import React, { useEffect, useState } from 'react';
import OfflineBanner from './components/common/OfflineBanner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { PastorDashboard } from './components/pastor/PastorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import LiderDashboard from './components/lider/LiderDashboard';
import SupervisorDashboard from './components/supervisor/SupervisorDashboard';

const Dashboard: React.FC = () => {
  // Este componente redirige según el rol del usuario
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Admin y Pastor usan el mismo dashboard
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else if (user.role === 'pastor') {
    return <PastorDashboard />;
  } else if (user.role === 'supervisor') {
    return <SupervisorDashboard />;
  } else if (user.role === 'lider' || user.role === 'colider' || user.role === 'timoteo') {
    return <LiderDashboard />;
  }
  
  return <Navigate to="/login" />;
};

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="card max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">Acceso Denegado</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          No tienes permisos para acceder a esta página.
        </p>
        <a href="/dashboard" className="btn btn-primary">
          Volver al Dashboard
        </a>
      </div>
    </div>
  );
};

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Interceptar botón "Atrás" de Android en modo PWA para ir al home en vez de salir
  useEffect(() => {
    // Empujar un estado inicial para que siempre haya historial
    window.history.pushState({ page: 'home' }, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      // Volver a empujar el estado para evitar que se vacíe el historial
      window.history.pushState({ page: 'home' }, '', '/dashboard');
      // Navegar al dashboard
      window.location.replace('/dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Capturar el prompt de instalación PWA de forma global
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__renacerDeferredPrompt = e;
      window.dispatchEvent(new CustomEvent('renacer-install-prompt-ready'));
    };

    const handleAppInstalled = () => {
      (window as any).__renacerDeferredPrompt = null;
      window.dispatchEvent(new CustomEvent('renacer-install-prompt-cleared'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          {isOffline && <OfflineBanner />}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pastor"
              element={
                <ProtectedRoute allowedRoles={['pastor']}>
                  <PastorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supervisor"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <SupervisorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lider"
              element={
                <ProtectedRoute allowedRoles={['lider', 'colider', 'timoteo']}>
                  <LiderDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
