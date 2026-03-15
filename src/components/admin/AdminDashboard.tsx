import React, { useState } from 'react';
import { ShieldCheck, Building2, ScrollText, Users } from 'lucide-react';
import { Navbar } from '../layout/Navbar';
import PastoresAdmin from './PastoresAdmin';
import AdminCelulasMiembros from './AdminCelulasMiembros';
import AdminAuditLogs from './AdminAuditLogs';

type AdminTab = 'pastores' | 'celulas' | 'logs';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('pastores');

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'pastores', label: 'Pastores', icon: <Users className="w-4 h-4" /> },
    { id: 'celulas', label: 'Células y Miembros', icon: <Building2 className="w-4 h-4" /> },
    { id: 'logs', label: 'Logs', icon: <ScrollText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Panel de Administración</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`btn flex items-center justify-center gap-2 ${
                  activeTab === tab.id ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'pastores' && <PastoresAdmin />}
        {activeTab === 'celulas' && <AdminCelulasMiembros />}
        {activeTab === 'logs' && <AdminAuditLogs />}
      </div>
    </div>
  );
};

export default AdminDashboard;
