import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { PastorDashboard } from './components/pastor/PastorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import LiderDashboard from './components/lider/LiderDashboard';

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
  } else if (user.role === 'lider' || user.role === 'colider') {
    return <LiderDashboard />;
  }
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
  
  return <Navigate to="/login" />;
};

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
        <p className="text-gray-600 mb-6">
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
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
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
              path="/lider"
              element={
                <ProtectedRoute allowedRoles={['lider', 'colider']}>
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
