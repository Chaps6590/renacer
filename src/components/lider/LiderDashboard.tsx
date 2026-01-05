import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, UserPlus, Trash2, Calendar, ArrowUp, ChevronRight } from 'lucide-react';
import { Navbar } from '../layout/Navbar';
import { AsistenciaModal } from './AsistenciaModal';
import { RolCelula } from '../../types';

export const LiderDashboard: React.FC = () => {
  const { user } = useAuth();
  const { celulas, addMiembroToCelula, removeMiembroFromCelula, updateMiembroRol } = useData();
  const [showAddMiembro, setShowAddMiembro] = useState(false);
  const [showAsistencia, setShowAsistencia] = useState(false);
  const [newMiembro, setNewMiembro] = useState({ name: '', phone: '', email: '' });

  // Obtener la célula del líder actual
  const miCelula = celulas.find(c => c.liderId === user?.id);

  const isLider = user?.role === 'lider';

  const handleAddMiembro = () => {
    if (miCelula && newMiembro.name) {
      const miembro = {
        id: Date.now().toString(),
        name: newMiembro.name,
        phone: newMiembro.phone,
        email: newMiembro.email,
        rolCelula: 'nuevo' as RolCelula,
        addedAt: new Date(),
      };
      addMiembroToCelula(miCelula.id, miembro);
      setNewMiembro({ name: '', phone: '', email: '' });
      setShowAddMiembro(false);
    }
  };

  const handleRemoveMiembro = (miembroId: string) => {
    if (miCelula && window.confirm('¿Estás seguro de eliminar esta persona?')) {
      removeMiembroFromCelula(miCelula.id, miembroId);
    }
  };

  const handlePromoverAMiembro = (miembroId: string) => {
    if (miCelula && isLider) {
      updateMiembroRol(miCelula.id, miembroId, 'miembro');
    }
  };

  const handlePromoverAColider = (miembroId: string) => {
    if (miCelula && isLider && window.confirm('¿Promover a Colíder? Podrá gestionar miembros y asistencia.')) {
      updateMiembroRol(miCelula.id, miembroId, 'colider');
    }
  };

  const handleDemoverANuevo = (miembroId: string) => {
    if (miCelula && isLider && window.confirm('¿Mover a Nuevo?')) {
      updateMiembroRol(miCelula.id, miembroId, 'nuevo');
    }
  };

  const getRolDisplay = (rol: RolCelula) => {
    const roles = {
      lider: 'Líder',
      colider: 'Colíder',
      miembro: 'Miembro',
      nuevo: 'Nuevo'
    };
    return roles[rol];
  };

  const getRolColor = (rol: RolCelula) => {
    const colors = {
      lider: 'bg-purple-100 text-purple-800 border-purple-300',
      colider: 'bg-blue-100 text-blue-800 border-blue-300',
      miembro: 'bg-green-100 text-green-800 border-green-300',
      nuevo: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[rol];
  };

  // Ordenar miembros: Líder principal, Colíderes, Miembros, Nuevos
  const miembrosOrdenados = miCelula ? [
    // Líder principal
    { 
      id: user?.id || 'lider', 
      name: miCelula.liderName, 2 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm mb-1">Total Personas</p>
                <p className="text-4xl font-bold">{miembrosOrdenados.length}</p>
              </div>
              <Users className="w-12 h-12 text-primary
            <p className="text-gray-600">No se encontró una célula asignada a tu usuario.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Mi Célula: {miCelula.name}</h2>
          <p className="text-gray-600">Gestiona tu célula y toma asistencia</p>
        </div>

        {/* Estadísticas de la Célula */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm mb-1">Total Miembros</p>
                <p className="text-4xl font-bold">{miCelula.miembros.length}</p>
              </div>
              <Users className="w-12 h-12 text-primary-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Colíderes</p>
                <p className="text-4xl font-bold">{miCelula.colideres.length}</p>
              </div>
              <UserPlus className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <button
              onClick={() => setShowAsistencia(true)}
              className="w-full h-full flex items-center justify-between text-left hover:opacity-90 transition-opacity"
            >
              <div>
                <p className="text-purple-100 text-sm mb-1">Tomar Asistencia</p>
                <p className="text-lg font-semibold">Registrar</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-200" />
            </button>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowAddMiembro(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Agregar Miembro
          </button>

          <button
            onClick={() => setShowAddColider(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Agregar Colíder
          </button>
        </div>Persona
          </button>
          {!isLider && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-sm">Eres Colíder - No puedes cambiar roles</span>
            </div>
          )}
        </div>) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {miCelula.miembros.map((miembro) => (
                    <tr key={miembro.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{miembro.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{miembro.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{miembro.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
             embrosOrdenados.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No hay miembros registrados. Agrega el primer miembro.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    {isLider && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {miembrosOrdenados.map((miembro) => (
                    <tr key={miembro.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{miembro.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRolColor(miembro.rolCelula)}`}>
                          {getRolDisplay(miembro.rolCelula)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{miembro.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{miembro.email || '-'}</div>
                      </td>
                      {isLider && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {miembro.rolCelula === 'lider' ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {miembro.rolCelula === 'nuevo' && (
                                <>
                                  <button
                                    onClick={() => handlePromoverAMiembro(miembro.id)}
                                    className="text-green-600 hover:text-green-800 flex items-center gap-1"
                                    title="Promover a Miembro"a Persona</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={newMiembro.name}
                    onChange={(e) => setNewMiembro({ ...newMiembro, name: e.target.value })}
                    className="input"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={newMiembro.phone}
                    onChange={(e) => setNewMiembro({ ...newMiembro, phone: e.target.value })}
                    className="input"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newMiembro.email}
                    onChange={(e) => setNewMiembro({ ...newMiembro, email: e.target.value })}
                    className="input"
                    placeholder="juan@email.com"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    La persona se agregará como "Nuevo". Luego podrás promoverla a Miembro o Colíder.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddMiembro}
                  className="btn btn-primary flex-1"
                  disabled={!newMiembro.name}
                >
                  Agregar
                </button>
                <button
                  onClick={() => {
                    setShowAddMiembro(false);
                    setNewMiembro({ name: '', phon
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newColider.email}
                    onChange={(e) => setNewColider({ ...newColider, email: e.target.value })}
                    className="input"
                    placeholder="maria@email.com"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    El colíder podrá gestionar miembros y tomar asistencia en esta célula.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddColider}
                  className="btn btn-primary flex-1"
                  disabled={!newColider.name || !newColider.email}
                >
                  Agregar
                </button>
                <button
                  onClick={() => {
                    setShowAddColider(false);
                    setNewColider({ name: '', email: '' });
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Asistencia */}
        {showAsistencia && (
          <AsistenciaModal
            celula={miCelula}
            onClose={() => setShowAsistencia(false)}
          />
        )}
      </div>
    </div>
  );
};
