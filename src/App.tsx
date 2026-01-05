import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { PastorDashboard } from './components/pastor/PastorDashboard';
import { LiderDashboard } from './components/lider/LiderDashboard';

const Dashboard: React.FC = () => {
  // Este componente redirige según el rol del usuario
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.role === 'pastor') {
    return <PastorDashboard />;
  } else if (user.role === 'lider' || user.role === 'colider') {
    return <LiderDashboard />;
  }
  
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
