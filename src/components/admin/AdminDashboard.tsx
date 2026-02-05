import React from 'react';
import { Navbar } from '../layout/Navbar';
import PastoresAdmin from './PastoresAdmin';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PastoresAdmin />
      </div>
    </div>
  );
};

export default AdminDashboard;
