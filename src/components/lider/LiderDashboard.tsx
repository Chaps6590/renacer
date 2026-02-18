import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Navbar } from '../layout/Navbar';
import { AsistenciaModal } from './AsistenciaModal';
import { PendientesModal } from './PendientesModal';
import { HistorialAsistenciasModal } from './HistorialAsistenciasModal';
import { MaterialesModal } from '../common/MaterialesModal';
import { NoticiasModal } from '../common/NoticiasModal';

import { DonacionesModal } from '../common/DonacionesModal';
import { CumpleanosModal } from '../common/CumpleanosModal';

import { Users, UserPlus, Calendar, Crown, Star, Trash2, Edit, CheckCircle2, XCircle, Bell, FileText, Newspaper, Heart, History } from 'lucide-react';

interface AddMiembroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (miembro: { name: string; phone?: string; email?: string; direccion?: string; isBautizado: boolean; tieneDiscipulado: boolean; fechaNacimiento?: string; isRegistered: boolean }) => void;
}

const AddMiembroModal: React.FC<AddMiembroModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    direccion: '',
    isBautizado: false,
    tieneDiscipulado: false,
    fechaNacimiento: '',
    isRegistered: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAdd({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        direccion: formData.direccion.trim() || undefined,
        isBautizado: formData.isBautizado,
        tieneDiscipulado: formData.tieneDiscipulado,
        fechaNacimiento: formData.fechaNacimiento || undefined,
        isRegistered: formData.isRegistered
      });
      setFormData({ name: '', phone: '', email: '', direccion: '', isBautizado: false, tieneDiscipulado: false, fechaNacimiento: '', isRegistered: true });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-4 text-center">
          <h3 className="text-xl font-bold text-white">Agregar Nueva Persona</h3>
          <p className="text-blue-100 text-sm mt-1">Ingresa los datos del nuevo miembro</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Ej: Juan Carlos Pérez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Ej: +54 9 11 1234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Ej: juan@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Dirección
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Ej: Calle 123, Ciudad"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
          </div>

          {/* Checkboxes */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isBautizado"
                checked={formData.isBautizado}
                onChange={(e) => setFormData({ ...formData, isBautizado: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isBautizado" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                ¿Está bautizado?
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="tieneDiscipulado"
                checked={formData.tieneDiscipulado}
                onChange={(e) => setFormData({ ...formData, tieneDiscipulado: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="tieneDiscipulado" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                ¿Tiene discipulado?
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:bg-gray-700 hover:border-gray-400 transition duration-200"
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
  const { celulas, addMiembroToCelula, removeMiembroFromCelula, removeColiderFromCelula, updateMiembroRol, getPendientesAsistencia, noticias } = useData();
  const [showAsistencia, setShowAsistencia] = useState(false);
  const [showAddMiembro, setShowAddMiembro] = useState(false);
  const [showPendientes, setShowPendientes] = useState(false);
  const [showMateriales, setShowMateriales] = useState(false);
  const [showNoticias, setShowNoticias] = useState(false);
  const [showDonaciones, setShowDonaciones] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [showCumpleanos, setShowCumpleanos] = useState(false);

  // Estados para modales de confirmación y acciones
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedMiembro, setSelectedMiembro] = useState<any>(null);

  // Obtener pendientes de asistencia
  const pendientesAsistencia = getPendientesAsistencia(user?.id || '');
  const totalPendientes = pendientesAsistencia.reduce((sum, p) => sum + p.cantidadPendientes, 0);

  // Obtener noticias importantes
  const noticiasImportantes = noticias.filter(n =>
    n.visible && n.importante && (!n.fechaVencimiento || new Date(n.fechaVencimiento) > new Date())
  ).length;

  // Encontrar la célula donde el usuario es líder, colíder o timoteo
  const miCelula = celulas.find(c =>
    c.liderId === user?.id ||
    c.coLideres.some(col => col.id === user?.id) ||
    (user?.role === 'timoteo' && c.miembros.some(m => m.email === user.email && m.rolCelula?.toLowerCase() === 'timoteo'))
  );

  // Verificar si el usuario es el líder principal
  const isLider = miCelula?.liderId === user?.id;

  const getRolDisplay = (rol: string) => {
    if (!rol) return '-';
    const roles: Record<string, string> = {
      lider: 'Líder',
      colider: 'Colíder',
      timoteo: 'Timoteo',
      miembro: 'Miembro',
      nuevo: 'Nuevo'
    };
    return roles[rol.toLowerCase()] || rol;
  };

  const getRolColor = (rol: string) => {
    if (!rol) return 'bg-gray-100 text-gray-800 border-gray-300';
    const colors: Record<string, string> = {
      lider: 'bg-purple-100 text-purple-800 border-purple-300',
      colider: 'bg-blue-100 text-blue-800 border-blue-300',
      timoteo: 'bg-orange-100 text-orange-800 border-orange-300',
      miembro: 'bg-green-100 text-green-800 border-green-300',
      nuevo: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[rol.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Ordenar miembros: Líder principal, Colíderes, Miembros, Nuevos
  // Evitamos duplicados si un miembro tiene rol 'colider' o 'lider' pero ya está arriba
  const miembrosOrdenados = miCelula ? [
    // Líder principal (usar datos desde miCelula directamente)
    {
      id: miCelula.liderId,
      name: miCelula.liderName,
      rolCelula: 'lider',
      email: miCelula.liderEmail || '-',
      phone: miCelula.liderPhone || '-',
      isBautizado: true, // Los líderes siempre tienen bautismo
      tieneDiscipulado: true // Los líderes siempre tienen discipulado
    },
    // Colíderes (Usuarios)
    ...miCelula.coLideres.map(colider => ({
      ...colider,
      rolCelula: 'colider',
      isBautizado: true, // Los colíderes siempre tienen bautismo
      tieneDiscipulado: true // Los colíderes siempre tienen discipulado
    })),
    // Otros miembros que no sean el líder ni los colíderes arriba
    ...miCelula.miembros.filter(m =>
      m.id !== miCelula.liderId &&
      !miCelula.coLideres.some(col => col.id === m.id)
    ).sort((a, b) => {
      // Orden por nivel: Timoteo > Miembro > Nuevo
      const priority: Record<string, number> = { TIMOTEO: 1, MIEMBRO: 2, NUEVO: 3 };
      const pA = priority[(a.rolCelula || 'nuevo').toUpperCase()] || 4;
      const pB = priority[(b.rolCelula || 'nuevo').toUpperCase()] || 4;
      return pA - pB;
    })
  ].filter(Boolean) : [];

  const handleAddMiembro = (miembroData: { name: string; phone?: string; email?: string; direccion?: string; isBautizado: boolean; tieneDiscipulado: boolean; fechaNacimiento?: string; isRegistered: boolean }) => {
    if (miCelula) {
      const nuevoMiembro = {
        id: `member-${Date.now()}`,
        name: miembroData.name,
        phone: miembroData.phone,
        email: miembroData.email,
        direccion: miembroData.direccion,
        addedAt: new Date(),
        rolCelula: 'nuevo' as const,
        isBautizado: miembroData.isBautizado,
        tieneDiscipulado: miembroData.tieneDiscipulado,
        fechaNacimiento: miembroData.fechaNacimiento,
        isRegistered: miembroData.isRegistered
      };

      addMiembroToCelula(miCelula.id, nuevoMiembro);
    }
  };

  // Nuevas funciones para acciones mejoradas
  const handleDeleteMiembro = (miembro: any) => {
    setSelectedMiembro(miembro);
    setShowDeleteConfirm(true);
  };

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const confirmDeleteMiembro = async () => {
    if (selectedMiembro && miCelula && isLider) {
      try {
        // Si es colíder, usar removeColiderFromCelula, si no, usar removeMiembroFromCelula
        if (selectedMiembro.rolCelula === 'colider') {
          await removeColiderFromCelula(miCelula.id, selectedMiembro.id);
        } else {
          await removeMiembroFromCelula(miCelula.id, selectedMiembro.id);
        }
        setShowDeleteConfirm(false);
        setSelectedMiembro(null);
      } catch (error: any) {
        let msg = selectedMiembro.rolCelula === 'colider' 
          ? 'Error al eliminar colíder.' 
          : 'Error al eliminar miembro.';
        if (error?.response?.status === 409 && error?.response?.data?.message) {
          msg = error.response.data.message;
        }
        setDeleteError(msg);
        setShowDeleteConfirm(false);
        setSelectedMiembro(null);
        setTimeout(() => setDeleteError(null), 6000);
      }
    } else {
      setShowDeleteConfirm(false);
      setSelectedMiembro(null);
    }
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No tienes una célula asignada</h3>
            <p className="text-gray-600 dark:text-gray-400">No se encontró una célula asignada a tu usuario.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Mi Célula: {miCelula.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">Gestiona tu célula y toma asistencia</p>
          <div className="mt-2 flex items-center gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              📅 {miCelula.diaSemana}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              🕐 {miCelula.horario}
            </span>
          </div>
        </div>
        {/* Estadísticas de la Célula */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm mb-1">Total Miembros</p>
                <p className="text-4xl font-bold">{miCelula.miembros.length + 1 + (miCelula.coLideres ? miCelula.coLideres.length : 0)}</p>
              </div>
              <Users className="w-12 h-12 text-primary-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="h-full flex flex-col md:flex-row gap-2 p-1">
              <button
                onClick={() => setShowAsistencia(true)}
                className="flex-1 flex items-center justify-between p-4 text-left hover:bg-white/10 rounded-xl transition-colors"
              >
                <div>
                  <p className="text-purple-100 text-sm mb-1">Tomar Asistencia</p>
                  <p className="text-lg font-semibold">Registrar</p>
                </div>
                <Calendar className="w-10 h-10 text-purple-200" />
              </button>
              <div className="w-px bg-purple-400/30 hidden md:block my-2"></div>
              <button
                onClick={() => setShowHistorial(true)}
                className="flex-1 flex items-center justify-between p-4 text-left bg-sky-500/20 hover:bg-sky-500/30 rounded-xl transition-colors border-t md:border-t-0 border-sky-300/40"
              >
                <div>
                  <p className="text-sky-100 text-sm mb-1">Ver Reportes</p>
                  <p className="text-lg font-semibold">Historial</p>
                </div>
                <History className="w-10 h-10 text-sky-200" />
              </button>
            </div>
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

          <button
            onClick={() => setShowPendientes(true)}
            className={`group inline-flex items-center gap-3 px-6 py-3 font-semibold rounded-xl transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${totalPendientes > 0
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'
              }`}
            disabled={totalPendientes === 0}
          >
            <Bell className="w-5 h-5 group-hover:scale-110 transition duration-300" />
            <span>Pendientes ({totalPendientes})</span>
            {totalPendientes > 0 && (
              <span className="bg-white dark:bg-gray-800 text-yellow-600 text-xs px-2 py-1 rounded-full">
                {totalPendientes}
              </span>
            )}
          </button>

          {!isLider && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-sm">Eres Colíder - No puedes cambiar roles</span>
            </div>
          )}
        </div>

        {/* Accesos Rápidos */}
        <div className="card mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recursos</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => setShowMateriales(true)}
                className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-blue-900">Materiales</div>
                    <div className="text-sm text-blue-700">Mensajes y recursos</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowNoticias(true)}
                className="group p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 hover:border-green-300 transition-all duration-200 relative"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <Newspaper className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-green-900">Noticias</div>
                    <div className="text-sm text-green-700">Anuncios de la iglesia</div>
                  </div>
                </div>
                {noticiasImportantes > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {noticiasImportantes}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowDonaciones(true)}
                className="group p-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-lg hover:from-red-100 hover:to-red-200 hover:border-red-300 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-red-900">Donaciones</div>
                    <div className="text-sm text-red-700">Apoyar la iglesia</div>
                  </div>
                </div>
              </button>

              {(() => {
                // Contador de cumpleaños del día en la célula
                const today = new Date();
                let cumpleanosHoy = 0;
                const getDayMonth = (dateString?: string) => {
                  if (!dateString) return null;
                  // Soporta 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.sssZ'
                  const clean = dateString.slice(0, 10);
                  const [year, month, day] = clean.split('-').map(Number);
                  if (!year || !month || !day) return null;
                  return { day, month };
                };
                if (miCelula) {
                  // Miembros
                  cumpleanosHoy += miCelula.miembros.filter(m => {
                    const dob = getDayMonth(m.fechaNacimiento);
                    if (!dob) return false;
                    return dob.day === today.getDate() && dob.month === (today.getMonth() + 1);
                  }).length;
                  // Colíderes
                  if (miCelula.coLideres) {
                    cumpleanosHoy += miCelula.coLideres.filter(c => {
                      const dob = getDayMonth(c.fechaNacimiento);
                      if (!dob) return false;
                      return dob.day === today.getDate() && dob.month === (today.getMonth() + 1);
                    }).length;
                  }
                  // Líder
                  if (miCelula.liderFechaNacimiento) {
                    const dob = getDayMonth(miCelula.liderFechaNacimiento);
                    if (dob && dob.day === today.getDate() && dob.month === (today.getMonth() + 1)) {
                      cumpleanosHoy += 1;
                    }
                  }
                }
                return (
                  <button
                    onClick={() => setShowCumpleanos(true)}
                    className="group p-4 bg-gradient-to-br from-pink-50 to-yellow-50 border-2 border-pink-200 rounded-lg hover:from-pink-100 hover:to-yellow-100 hover:border-pink-300 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-pink-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-pink-900">Cumpleaños</div>
                        <div className="text-sm text-pink-700">Ver próximos</div>
                      </div>
                      {/* Notificación si hay cumpleaños hoy */}
                      {cumpleanosHoy > 0 && (
                        <span className="ml-auto bg-pink-500 text-white rounded-full px-3 py-1 text-lg font-bold shadow animate-pulse">
                          {cumpleanosHoy}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Lista de Miembros */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Miembros de la Célula</h3>
          </div>

          {miembrosOrdenados.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No hay miembros registrados. Agrega el primer miembro.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Bautizado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Discipulado
                    </th>
                    {isLider && (
                      <>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Cambiar Rol
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Eliminar
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {miembrosOrdenados
                    .map((miembro) => (
                      <tr key={miembro.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{miembro.name}</div>
                          {miembro.rolCelula?.toLowerCase() === 'lider' && (
                            <Crown className="w-4 h-4 text-purple-500 ml-2" />
                          )}
                          {miembro.rolCelula?.toLowerCase() === 'colider' && (
                            <Star className="w-4 h-4 text-blue-500 ml-2" />
                          )}
                          {miembro.rolCelula?.toLowerCase() === 'timoteo' && (
                            <Star className="w-4 h-4 text-orange-500 ml-2 fill-orange-200" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRolColor(miembro.rolCelula)}`}>
                          {getRolDisplay(miembro.rolCelula)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {'phone' in miembro ? (miembro.phone || '-') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {'email' in miembro ? (miembro.email || '-') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {'isBautizado' in miembro ? (
                          miembro.isBautizado ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Sí
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              <XCircle className="w-3 h-3 mr-1" />
                              No
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {'tieneDiscipulado' in miembro ? (
                          miembro.tieneDiscipulado ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Sí
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              <XCircle className="w-3 h-3 mr-1" />
                              No
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      {isLider && (
                        <>
                          {/* Columna Cambiar Rol */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {miembro.rolCelula === 'lider' || miembro.rolCelula === 'colider' ? (
                              <button
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed"
                                title={miembro.rolCelula === 'lider' ? "No puedes cambiar el rol del líder principal" : "No puedes cambiar el rol de los colíderes"}
                                disabled
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Cambiar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleChangeRole(miembro)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition duration-200"
                                title="Cambiar Rol"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Cambiar
                              </button>
                            )}
                          </td>

                          {/* Columna Eliminar */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {miembro.rolCelula === 'lider' ? (
                              <button
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed"
                                title="No puedes eliminar al líder principal"
                                disabled
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Eliminar
                              </button>
                            ) : miembro.rolCelula === 'colider' ? (
                              <button
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed"
                                title="Solo admin o pastor pueden eliminar colíderes"
                                disabled
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Eliminar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeleteMiembro(miembro)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition duration-200"
                                title="Eliminar Miembro"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Eliminar
                              </button>
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-center">
                <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Confirmar Eliminación
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  ¿Estás seguro de que deseas eliminar a
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-lg mb-4">
                  {selectedMiembro?.name}?
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Esta acción no se puede deshacer.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:bg-gray-700 hover:border-gray-400 transition duration-200"
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

        {/* Cartel de error al eliminar miembro */}
        {deleteError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-xl font-semibold text-center animate-fade-in">
            {deleteError}
          </div>
        )}

        {/* Modal de selección de rol */}
        {showRoleDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                  className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-300 hover:bg-green-50 transition duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full group-hover:scale-110 transition duration-200"></div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Miembro</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Miembro regular de la célula</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => confirmChangeRole('colider')}
                  className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full group-hover:scale-110 transition duration-200"></div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Colíder <Star className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Ayudante del líder de célula</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => confirmChangeRole('timoteo')}
                  className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full group-hover:scale-110 transition duration-200"></div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Timoteo</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Ayudante en formación</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => confirmChangeRole('nuevo')}
                  className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-yellow-300 hover:bg-yellow-50 transition duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full group-hover:scale-110 transition duration-200"></div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Nuevo</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Persona nueva en la célula</div>
                    </div>
                  </div>
                </button>

                {/* Botón cancelar */}
                <button
                  onClick={() => setShowRoleDialog(false)}
                  className="w-full mt-4 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:bg-gray-700 hover:border-gray-400 transition duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de pendientes */}
        <PendientesModal
          isOpen={showPendientes}
          onClose={() => setShowPendientes(false)}
        />

        {/* Modal de historial de asistencia */}
        {miCelula && (
          <HistorialAsistenciasModal
            celulaId={miCelula.id}
            isOpen={showHistorial}
            onClose={() => setShowHistorial(false)}
          />
        )}

        {/* Modal de materiales */}
        <MaterialesModal
          isOpen={showMateriales}
          onClose={() => setShowMateriales(false)}
        />

        {/* Modal de noticias */}
        <NoticiasModal
          isOpen={showNoticias}
          onClose={() => setShowNoticias(false)}
        />

        {/* Modal de donaciones */}
        <DonacionesModal
          isOpen={showDonaciones}
          onClose={() => setShowDonaciones(false)}
        />

        {/* Modal de cumpleaños */}
        <CumpleanosModal
          isOpen={showCumpleanos}
          onClose={() => setShowCumpleanos(false)}
        />
      </div>
    </div>
  );
};

export default LiderDashboard;