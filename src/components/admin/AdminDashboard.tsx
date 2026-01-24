import React from 'react';
import PastoresAdmin from '../admin/PastoresAdmin';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
        <PastoresAdmin />
      </div>
    </div>
  );
};

export default AdminDashboard;
