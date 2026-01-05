import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Navbar } from '../layout/Navbar';
import { AsistenciaModal } from './AsistenciaModal';
import { Users, UserPlus, Calendar, Crown, Star, Trash2, Edit } from 'lucide-react';
import type { RolCelula } from '../../types';

interface AddMiembroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (miembro: { name: string; phone?: string; email?: string }) => void;
}

const AddMiembroModal: React.FC<AddMiembroModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAdd({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined
      });
      setFormData({ name: '', phone: '', email: '' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-4 text-center">
          <h3 className="text-xl font-bold text-white">Agregar Nueva Persona</h3>
          <p className="text-blue-100 text-sm mt-1">Ingresa los datos del nuevo miembro</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-gray-900 placeholder-gray-500"
              placeholder="Ej: Juan Carlos Pérez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-gray-900 placeholder-gray-500"
              placeholder="Ej: +54 9 11 1234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-gray-900 placeholder-gray-500"
              placeholder="Ej: juan@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-semibold rounded-xl transition duration-200 shadow-lg hover:shadow-xl"
            >
              Agregar Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LiderDashboard: React.FC = () => {
  const { user } = useAuth();
  const { celulas, addMiembroToCelula, updateMiembroRol } = useData();
  const [showAsistencia, setShowAsistencia] = useState(false);
  const [showAddMiembro, setShowAddMiembro] = useState(false);
  
  // Estados para modales de confirmación y acciones
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedMiembro, setSelectedMiembro] = useState<any>(null);

  // Encontrar la célula donde el usuario es líder o colíder
  const miCelula = celulas.find(c => 
    c.liderId === user?.id || 
    c.colideres.some(col => col.id === user?.id)
  );

  // Verificar si el usuario es el líder principal
  const isLider = miCelula?.liderId === user?.id;

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
      id: miCelula.liderId,
      name: miCelula.liderName,
      rolCelula: 'lider' as const
    },
    // Colíderes
    ...miCelula.colideres.map(colider => ({
      ...colider,
      rolCelula: 'colider' as const
    })),
    // Miembros y nuevos
    ...miCelula.miembros
  ].filter(Boolean) : [];

  const handleAddMiembro = (miembroData: { name: string; phone?: string; email?: string }) => {
    if (miCelula) {
      const nuevoMiembro = {
        id: `member-${Date.now()}`,
        name: miembroData.name,
        phone: miembroData.phone,
        email: miembroData.email,
        addedAt: new Date(),
        rolCelula: 'nuevo' as const
      };
      
      addMiembroToCelula(miCelula.id, nuevoMiembro);
    }
  };

  // Nuevas funciones para acciones mejoradas
  const handleDeleteMiembro = (miembro: any) => {
    setSelectedMiembro(miembro);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMiembro = () => {
    if (selectedMiembro && miCelula && isLider) {
      // TODO: Implementar eliminación en el contexto
      console.log('Eliminar miembro:', selectedMiembro.name);
    }
    setShowDeleteConfirm(false);
    setSelectedMiembro(null);
  };

  const handleChangeRole = (miembro: any) => {
    setSelectedMiembro(miembro);
    setShowRoleDialog(true);
  };

  const confirmChangeRole = (newRole: string) => {
    if (selectedMiembro && miCelula && isLider) {
      updateMiembroRol(miCelula.id, selectedMiembro.id, newRole as any);
    }
    setShowRoleDialog(false);
    setSelectedMiembro(null);
  };

  if (!miCelula) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes una célula asignada</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm mb-1">Total Miembros</p>
                <p className="text-4xl font-bold">{miCelula.miembros.length}</p>
              </div>
              <Users className="w-12 h-12 text-primary-200" />
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
            className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition duration-300" />
            <span>Agregar Nueva Persona</span>
          </button>
          {!isLider && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-sm">Eres Colíder - No puedes cambiar roles</span>
            </div>
          )}
        </div>

        {/* Lista de Miembros */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Miembros de la Célula</h3>
          </div>
          
          {miembrosOrdenados.length === 0 ? (
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
                      <>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cambiar Rol
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Eliminar
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {miembrosOrdenados.map((miembro) => (
                    <tr key={miembro.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{miembro.name}</div>
                          {miembro.rolCelula === 'lider' && (
                            <Crown className="w-4 h-4 text-purple-500 ml-2" />
                          )}
                          {miembro.rolCelula === 'colider' && (
                            <Star className="w-4 h-4 text-blue-500 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRolColor(miembro.rolCelula)}`}>
                          {getRolDisplay(miembro.rolCelula)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {'phone' in miembro ? (miembro.phone || '-') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {'email' in miembro ? (miembro.email || '-') : '-'}
                        </div>
                      </td>
                      {isLider && (
                        <>
                          {/* Columna Cambiar Rol */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {miembro.rolCelula !== 'lider' ? (
                              <button
                                onClick={() => handleChangeRole(miembro)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition duration-200"
                                title="Cambiar Rol"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Cambiar
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg">
                                Protegido
                              </span>
                            )}
                          </td>
                          
                          {/* Columna Eliminar */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {miembro.rolCelula !== 'lider' ? (
                              <button
                                onClick={() => handleDeleteMiembro(miembro)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition duration-200"
                                title="Eliminar Miembro"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Eliminar
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg">
                                Protegido
                              </span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal para agregar miembro */}
        <AddMiembroModal
          isOpen={showAddMiembro}
          onClose={() => setShowAddMiembro(false)}
          onAdd={handleAddMiembro}
        />

        {/* Modal de asistencia */}
        {showAsistencia && (
          <AsistenciaModal
            celula={miCelula}
            onClose={() => setShowAsistencia(false)}
          />
        )}

        {/* Modal de confirmación para eliminar */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-center">
                <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Confirmar Eliminación
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <p className="text-gray-700 mb-2">
                  ¿Estás seguro de que deseas eliminar a
                </p>
                <p className="font-bold text-gray-900 text-lg mb-4">
                  {selectedMiembro?.name}?
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Esta acción no se puede deshacer.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteMiembro}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition duration-200 shadow-lg hover:shadow-xl"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de selección de rol */}
        {showRoleDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-4 text-center">
                <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  <Edit className="w-5 h-5" />
                  Cambiar Rol
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  Selecciona el nuevo rol para {selectedMiembro?.name}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                {/* Opciones de rol */}
                <button
                  onClick={() => confirmChangeRole('miembro')}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full group-hover:scale-110 transition duration-200"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Miembro</div>
                      <div className="text-sm text-gray-600">Miembro regular de la célula</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => confirmChangeRole('colider')}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full group-hover:scale-110 transition duration-200"></div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        Colíder <Star className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-sm text-gray-600">Ayudante del líder de célula</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => confirmChangeRole('nuevo')}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full group-hover:scale-110 transition duration-200"></div>
                    <div>
                      <div className="font-semibold text-gray-900">Nuevo</div>
                      <div className="text-sm text-gray-600">Persona nueva en la célula</div>
                    </div>
                  </div>
                </button>

                {/* Botón cancelar */}
                <button
                  onClick={() => setShowRoleDialog(false)}
                  className="w-full mt-4 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiderDashboard;