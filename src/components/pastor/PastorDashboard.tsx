import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Users, BarChart3, UserPlus, Download, TrendingUp, Plus, Edit2, X, Trash2, FileText, Newspaper, Heart, AlertCircle, Gift } from 'lucide-react';
import { Navbar } from '../layout/Navbar';
import { MaterialesModal } from '../common/MaterialesModal';
import { NoticiasModal } from '../common/NoticiasModal';
import { DonacionesModal } from '../common/DonacionesModal';
import { PeticionesModal } from '../common/PeticionesModal';
import { CumpleanosModal } from '../common/CumpleanosModal';
import SupervisoresAdmin from './SupervisoresAdmin';
import { User } from '../../types';
import { api } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Lider extends User {
  celulaAsignada?: string;
  nombreCelula?: string;
}

export const PastorDashboard: React.FC = () => {
  const { celulas, asistencias, noticias, materiales, configuracionDonaciones, recargarCelulas, peticionesPastor, deleteCelula, deleteLider } = useData();
    // Estado para eliminar líder
    const [liderAEliminar, setLiderAEliminar] = useState<string | null>(null);
    const [showDeleteLider, setShowDeleteLider] = useState(false);

    const handleDeleteLider = (id: string) => {
      setLiderAEliminar(id);
      setShowDeleteLider(true);
    };

    const confirmDeleteLider = async () => {
      if (!liderAEliminar) return;
      try {
        await deleteLider(liderAEliminar);
        setShowDeleteLider(false);
        setLiderAEliminar(null);
        alert('Líder eliminado exitosamente');
        await enrichLideresWithCelulas();
      } catch (error: any) {
        alert(error.message || 'Error al eliminar el líder');
      }
    };
  // Estado para eliminar célula
  const [celulaAEliminar, setCelulaAEliminar] = useState<string | null>(null);
  const [showDeleteCelula, setShowDeleteCelula] = useState(false);

  const handleDeleteCelula = (id: string) => {
    setCelulaAEliminar(id);
    setShowDeleteCelula(true);
  };

  const confirmDeleteCelula = async () => {
    if (!celulaAEliminar) return;
    try {
      await deleteCelula(celulaAEliminar);
      setShowDeleteCelula(false);
      setCelulaAEliminar(null);
      alert('Célula eliminada exitosamente');
    } catch (error: any) {
      alert(error.message || 'Error al eliminar la célula');
    }
  };
// ...resto del componente...
  const [view, setView] = useState<'dashboard' | 'lideres' | 'supervisores' | 'celulas' | 'recursos' | 'cumpleanos'>('dashboard');

  // Estados para modales de recursos
  const [showMateriales, setShowMateriales] = useState(false);
  const [showNoticias, setShowNoticias] = useState(false);
  const [showDonaciones, setShowDonaciones] = useState(false);
  const [showPeticiones, setShowPeticiones] = useState(false);
  const [showCumpleanos, setShowCumpleanos] = useState(false);

  // Estado para líderes
  const [lideres, setLideres] = useState<Lider[]>([]);
  const [loadingLideres, setLoadingLideres] = useState(false);


  // Función para enriquecer líderes con información de células
  const enrichLideresWithCelulas = async () => {
    setLoadingLideres(true);
    try {
      // Obtener todos los usuarios y filtrar líderes
      const users = await api.getUsers() as User[];
      const lideresUsuarios = users.filter((u) => u.role && u.role.toLowerCase() === 'lider');

      // Enriquecer con información de células
      const lideresEnriquecidos = lideresUsuarios.map(lider => {
        // Buscar si este líder es el líder principal de una célula
        const celulaDelLider = celulas.find(c => c.liderId === lider.id);
        if (celulaDelLider) {
          return {
            ...lider,
            celulaAsignada: celulaDelLider.id,
            nombreCelula: `${celulaDelLider.name} (Líder)`
          };
        }

        // Buscar si este líder es colíder de alguna célula
        const celulaComoColider = celulas.find(c =>
          c.coLideres.some(col => col.id === lider.id)
        );
        if (celulaComoColider) {
          return {
            ...lider,
            celulaAsignada: celulaComoColider.id,
            nombreCelula: `${celulaComoColider.name} (Colíder)`
          };
        }

        return lider;
      });

      setLideres(lideresEnriquecidos);
    } catch (e) {
      setLideres([]);
    }
    setLoadingLideres(false);
  };

  // Cargar líderes cuando celulas cambie
  useEffect(() => {
    enrichLideresWithCelulas();
  }, [celulas]);


  const [showAddLider, setShowAddLider] = useState(false);
  const [showEditLider, setShowEditLider] = useState(false);
  const [newLider, setNewLider] = useState({ name: '', email: '', fechaNacimiento: '', telefono: '' });
  const [editingLider, setEditingLider] = useState<Lider | null>(null);

  // Estado para células
  const [showAddCelula, setShowAddCelula] = useState(false);
  const [showEditCelula, setShowEditCelula] = useState(false);
  const [newCelula, setNewCelula] = useState({ name: '', liderId: '', diaSemana: '', horario: '', coliderIds: [] as string[] });
  const [editingCelula, setEditingCelula] = useState<{ id: string, name: string, liderId: string, diaSemana: string, horario: string, coliderIds: string[] } | null>(null);
  const [coliderSearch, setColiderSearch] = useState(''); // Estado para búsqueda de colíderes

  const [timeframe] = useState<'semanal' | 'mensual' | 'anual'>('semanal');

  // Función para agregar líder
  const handleAddLider = async () => {
    if (!newLider.name.trim()) return;
    try {
      const liderData = {
        name: newLider.name,
        email: newLider.email || `${newLider.name.toLowerCase().replace(/\s+/g, '.')}@renacer.com`,
        password: 'Renacer', // Contraseña por defecto
        role: 'LIDER',
        fechaNacimiento: newLider.fechaNacimiento || undefined,
        telefono: newLider.telefono || undefined
      };
      await api.createUser(liderData);
      setNewLider({ name: '', email: '', fechaNacimiento: '', telefono: '' });
      setShowAddLider(false);
      // Refrescar lista de líderes
      await enrichLideresWithCelulas();
    } catch (error: any) {
      console.error('Error creando líder:', error);
      alert(error.message || 'Error al crear el líder');
    }
  };

  // Función para editar líder
  const handleEditLider = async () => {
    if (!editingLider || !editingLider.name.trim()) return;
    try {
      await api.updateUser(editingLider.id, {
        name: editingLider.name,
        email: editingLider.email,
        fechaNacimiento: editingLider.fechaNacimiento,
        telefono: (editingLider as any).telefono
      });
      setEditingLider(null);
      setShowEditLider(false);
      // Refrescar lista de líderes
      await enrichLideresWithCelulas();
    } catch (error: any) {
      console.error('Error actualizando líder:', error);
      alert(error.message || 'Error al actualizar el líder');
    }
  };

  // Función para abrir modal de edición
  const openEditLider = (lider: Lider) => {
    setEditingLider({
      ...lider,
      fechaNacimiento: lider.fechaNacimiento ? new Date(lider.fechaNacimiento).toISOString().split('T')[0] : '',
      telefono: (lider as any).telefono || ''
    } as any);
    setShowEditLider(true);
  };

  // Función para crear célula
  const handleAddCelula = async () => {
    if (!newCelula.name.trim() || !newCelula.liderId || !newCelula.diaSemana || !newCelula.horario) return;

    try {
      await api.crearCelula({
        name: newCelula.name,
        diaSemana: newCelula.diaSemana,
        horario: newCelula.horario,
        liderId: newCelula.liderId,
        coliderIds: newCelula.coliderIds
      });

      // Recargar células desde el backend
      await recargarCelulas();

      setNewCelula({ name: '', liderId: '', diaSemana: '', horario: '', coliderIds: [] });
      setShowAddCelula(false);
      setColiderSearch('');
      alert('Célula creada exitosamente');
    } catch (error: any) {
      console.error('Error creando célula:', error);
      alert(error.message || 'Error al crear la célula');
    }
  };

  // Función para abrir modal de edición de célula
  const openEditCelula = (celula: any) => {
    setEditingCelula({
      id: celula.id,
      name: celula.name,
      liderId: celula.liderId,
      diaSemana: celula.diaSemana,
      horario: celula.horario,
      coliderIds: celula.coLideres.map((c: any) => c.id)
    });
    setColiderSearch('');
    setShowEditCelula(true);
  };

  // Función para guardar cambios de célula
  const handleEditCelula = async () => {
    if (!editingCelula || !editingCelula.name.trim()) return;

    try {
      await api.actualizarCelula(editingCelula.id, {
        name: editingCelula.name,
        diaSemana: editingCelula.diaSemana,
        horario: editingCelula.horario,
        liderId: editingCelula.liderId,
        coliderIds: editingCelula.coliderIds
      });

      await recargarCelulas();
      setShowEditCelula(false);
      setEditingCelula(null);
      setColiderSearch('');
      alert('Célula actualizada exitosamente');
    } catch (error: any) {
      console.error('Error actualizando célula:', error);
      alert(error.message || 'Error al actualizar la célula');
    }
  };

  // Obtener líderes sin célula
  const lideresDisponibles = lideres.filter(l => !l.celulaAsignada);

  // Lógica de cumpleaños
  const getUpcomingBirthdays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche

    const getDayMonth = (dateString?: string) => {
      if (!dateString) return null;
      const clean = dateString.slice(0, 10); // Solo 'YYYY-MM-DD'
      const [year, month, day] = clean.split('-').map(Number);
      if (!year || !month || !day) return null;
      return { day, month };
    };

    // Calcular cuántos días faltan para el cumpleaños (0-7 para esta semana)
    const getDaysUntilBirthday = (dateString?: string): number | null => {
      const dob = getDayMonth(dateString);
      if (!dob) return null;
      
      for (let i = 0; i <= 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        if (dob.day === checkDate.getDate() && dob.month === checkDate.getMonth() + 1) {
          return i;
        }
      }
      return null;
    };

    // Recolectar todos los cumpleaños próximos
    const allBirthdays: any[] = [];

    // Miembros de células
    celulas.forEach(c => {
      c.miembros.forEach(m => {
        const daysUntil = getDaysUntilBirthday(m.fechaNacimiento);
        if (daysUntil !== null) {
          allBirthdays.push({ ...m, type: 'Miembro', celulaName: c.name, liderName: c.liderName, daysUntil });
        }
      });
    });

    // Líderes
    lideres.forEach(l => {
      const daysUntil = getDaysUntilBirthday(l.fechaNacimiento);
      if (daysUntil !== null) {
        allBirthdays.push({ ...l, type: 'Líder', celulaName: l.nombreCelula || 'Sin asignar', daysUntil });
      }
    });

    // Colíderes
    celulas.forEach(c => {
      c.coLideres?.forEach(cl => {
        const daysUntil = getDaysUntilBirthday(cl.fechaNacimiento);
        if (daysUntil !== null) {
          allBirthdays.push({ ...cl, type: 'Colíder', celulaName: c.name, liderName: c.liderName, daysUntil });
        }
      });
    });

    // Ordenar por días próximos (0 = hoy primero, luego 1, 2, etc.)
    return allBirthdays.sort((a, b) => {
      if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
      // Si es el mismo día, ordenar alfabéticamente por nombre
      return (a.name || '').localeCompare(b.name || '');
    });
  };

  const birthdays = getUpcomingBirthdays();

  const getEstadisticas = () => {
    return celulas.map(celula => {
      const celasAsistencias = asistencias.filter(a => a.celulaId === celula.id);
      // Contar solo miembros registrados (el líder y colíderes no registran su propia asistencia)
      const totalMiembros = celula.miembros.length;

      const totalPresentes = celasAsistencias.reduce((sum, a) => sum + a.totalPresentes, 0);
      const promedioAsistencia = celasAsistencias.length > 0 && totalMiembros > 0
        ? Math.round((totalPresentes / celasAsistencias.length / totalMiembros) * 100)
        : 0;

      return {
        celulaId: celula.id,
        celulaNombre: celula.name,
        liderNombre: celula.liderName,
        totalMiembros,
        cantidadAsistencias: celasAsistencias.length,
        promedioAsistencia,
      };
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const estadisticas = getEstadisticas();

    doc.setFontSize(18);
    doc.text('Reporte de Células - Iglesia Renacer', 14, 20);

    doc.setFontSize(12);
    doc.text(`Período: ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}`, 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 37);

    const tableData = estadisticas.map(e => [
      e.celulaNombre,
      e.liderNombre,
      e.totalMiembros.toString(),
      e.cantidadAsistencias.toString(),
      `${e.promedioAsistencia}%`,
    ]);

    autoTable(doc, {
      head: [['Célula', 'Líder', 'Miembros', 'Asistencias', 'Promedio']],
      body: tableData,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] },
    });

    const totalMiembros = estadisticas.reduce((sum, e) => sum + e.totalMiembros, 0);
    const promedioGeneral = Math.round(
      estadisticas.reduce((sum, e) => sum + e.promedioAsistencia, 0) / estadisticas.length
    );

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total de Células: ${celulas.length}`, 14, finalY);
    doc.text(`Total de Miembros: ${totalMiembros}`, 14, finalY + 7);
    doc.text(`Promedio General de Asistencia: ${promedioGeneral}%`, 14, finalY + 14);

    doc.save(`reporte-celulas-${timeframe}-${Date.now()}.pdf`);
  };

  const estadisticas = getEstadisticas();
  const totalMiembros = estadisticas.reduce((sum, e) => sum + e.totalMiembros, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Dashboard del Pastor</h2>
          <p className="text-gray-600 dark:text-gray-400">Gestión de células y líderes</p>
        </div>

        {/* Navegación de vistas */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${view === 'dashboard'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('lideres')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${view === 'lideres'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
          >
            Líderes
          </button>
          <button
            onClick={() => setView('supervisores')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${view === 'supervisores'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
          >
            Supervisores
          </button>
          <button
            onClick={() => setView('celulas')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${view === 'celulas'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
          >
            Células
          </button>
          <button
            onClick={() => setView('recursos')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${view === 'recursos'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
          >
            Recursos
          </button>
          <button
            onClick={() => setView('cumpleanos')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${view === 'cumpleanos'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
          >
            Cumpleaños
          </button>
        </div>

        {/* Vista Dashboard */}
        {view === 'dashboard' && (
          <>
            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-100 text-sm mb-1">Total Células</p>
                    <p className="text-4xl font-bold">{celulas.length}</p>
                  </div>
                  <Users className="w-12 h-12 text-primary-200" />
                </div>
              </div>

              <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Total Miembros</p>
                    <p className="text-4xl font-bold">{totalMiembros}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-200" />
                </div>
              </div>

              <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">Líderes Activos</p>
                    <p className="text-4xl font-bold">{lideres.filter(l => l.celulaAsignada).length}</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-purple-200" />
                </div>
              </div>

              {/* Tarjeta de Cumpleaños con notificación si hay cumpleaños hoy */}
              <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setView('cumpleanos')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm mb-1">Cumpleaños</p>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl">🎂</span>
                      {(() => {
                        const today = new Date();
                        const getDayMonth = (dateString?: string) => {
                          if (!dateString) return null;
                          const clean = dateString.slice(0, 10);
                          const [year, month, day] = clean.split('-').map(Number);
                          if (!year || !month || !day) return null;
                          return { day, month };
                        };
                        const cumpleanosHoy = birthdays.filter(b => {
                          const dob = getDayMonth(b.fechaNacimiento);
                          if (!dob) return false;
                          return dob.day === today.getDate() && dob.month === (today.getMonth() + 1);
                        }).length;
                        return cumpleanosHoy > 0 ? (
                          <span className="ml-1 bg-white dark:bg-gray-800 text-pink-600 rounded-full px-3 py-1 text-lg font-bold shadow">{cumpleanosHoy}</span>
                        ) : null;
                      })()}
                    </div>
                    <p className="text-pink-200 text-xs">Ver próximos</p>
                  </div>
                  <Heart className="w-12 h-12 text-pink-200" />
                </div>
              </div>

              <div
                className="card bg-gradient-to-br from-orange-500 to-red-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowPeticiones(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Peticiones</p>
                    <p className="text-4xl font-bold">
                      {peticionesPastor.filter(p => !p.resuelta).length}
                    </p>
                    <p className="text-orange-200 text-xs">Atender ahora</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={exportToPDF}
                className="btn btn-secondary flex items-center gap-2 ml-auto"
              >
                <Download className="w-5 h-5" />
                Descargar PDF
              </button>
            </div>

            {/* Lista de Células */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Células y Estadísticas</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Célula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Líder
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Miembros
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Asistencias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {estadisticas.map((est) => (
                      <tr key={est.celulaId} className="hover:bg-gray-50 dark:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{est.celulaNombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{est.liderNombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{est.totalMiembros}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{est.cantidadAsistencias}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${est.promedioAsistencia >= 80 ? 'bg-green-100 text-green-800' :
                            est.promedioAsistencia >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {est.promedioAsistencia}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Vista Líderes */}
        {view === 'lideres' && (
          <>
            {loadingLideres && <div className="mb-4 text-blue-600">Cargando líderes...</div>}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gestión de Líderes</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total: {lideres.length} líderes</p>
              </div>
              <button
                onClick={() => setShowAddLider(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Agregar Líder
              </button>
            </div>



            {/* Tabla de líderes */}
            <div className="card">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Todos los Líderes</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Célula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Contraseña
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {lideres.map((lider) => (
                      <tr key={lider.id} className="hover:bg-gray-50 dark:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{lider.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{lider.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-400">{(lider as any).telefono || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lider.nombreCelula ? (
                            <span className="text-sm text-gray-900 dark:text-white">{lider.nombreCelula}</span>
                          ) : (
                            <span className="text-sm text-gray-400">Sin asignar</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lider.isRegistered ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Activo
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                              Pendiente ingreso
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300">Renacer</code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                          <button
                            onClick={() => openEditLider(lider)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar líder"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLider(lider.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar líder"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Vista Supervisores */}
        {view === 'supervisores' && (
          <SupervisoresAdmin celulas={celulas} />
        )}

        {/* Vista Células */}
        {view === 'celulas' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gestión de Células</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total: {celulas.length} células</p>
              </div>
              <button
                onClick={() => setShowAddCelula(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Crear Célula
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {celulas.map(celula => (
                <div key={celula.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{celula.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Líder: {celula.liderName}</p>
                      <p className="text-sm text-blue-600 font-medium mt-1">
                        {celula.diaSemana} - {celula.horario}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditCelula(celula)}
                        className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition-colors"
                        title="Editar célula"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCelula(celula.id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                        title="Eliminar célula"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Miembros:</span>
                      <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-white font-bold shadow-sm border border-gray-200 dark:border-gray-700">
                        {celula.miembros.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Colíderes:</span>
                      <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-white font-bold shadow-sm border border-gray-200 dark:border-gray-700">
                        {celula.coLideres.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-gray-600 dark:text-gray-400">Creada:</span>
                      <span className="font-semibold">
                        {new Date(celula.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
                  {/* Modal de confirmación para eliminar célula */}
                  {showDeleteCelula && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">Eliminar Célula</h3>
                          <button onClick={() => setShowDeleteCelula(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">¿Estás seguro de que deseas eliminar esta célula? Esta acción no se puede deshacer.</p>
                        <div className="flex gap-4 mt-6">
                          <button
                            onClick={confirmDeleteCelula}
                            className="btn btn-danger flex-1"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => setShowDeleteCelula(false)}
                            className="btn btn-secondary flex-1"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
            </div>
          </>
        )}

        {/* Modal Agregar Líder */}
        {showAddLider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Agregar Nuevo Líder</h3>
                <button onClick={() => setShowAddLider(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={newLider.name}
                    onChange={(e) => setNewLider({ ...newLider, name: e.target.value })}
                    className="input"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newLider.email}
                    onChange={(e) => setNewLider({ ...newLider, email: e.target.value })}
                    className="input"
                    placeholder="juan@email.com"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si no se ingresa, se generará automáticamente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={newLider.fechaNacimiento}
                    onChange={(e) => setNewLider({ ...newLider, fechaNacimiento: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={newLider.telefono}
                    onChange={(e) => setNewLider({ ...newLider, telefono: e.target.value })}
                    className="input"
                    placeholder="Ej: +54 9 11 ..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Contraseña por defecto: <code className="bg-blue-100 px-2 py-1 rounded">Renacer</code>
                  </p>
                  <p className="text-xs text-blue-700">
                    El líder podrá cambiar su contraseña después de registrarse.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddLider}
                  className="btn btn-primary flex-1"
                  disabled={!newLider.name.trim()}
                >
                  Agregar
                </button>
                <button
                  onClick={() => setShowAddLider(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vista Cumpleaños */}
        {view === 'cumpleanos' && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-pink-100 p-2 rounded-full">
                <Heart className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cumpleaños de la Semana</h3>
                <p className="text-gray-600 dark:text-gray-400">Próximos 7 días</p>
              </div>
            </div>

            {birthdays.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {birthdays.map((person: any) => {
                  const dobParts = (() => {
                    if (!person.fechaNacimiento) return null;
                    const [datePart] = person.fechaNacimiento.split(' ');
                    const [year, month, day] = datePart.split('-').map(Number);
                    if (!year || !month || !day) return null;
                    return { day, month };
                  })();
                  const today = new Date();
                  const isToday = dobParts && dobParts.day === today.getDate() && dobParts.month === (today.getMonth() + 1);

                  const daysLabel = (() => {
                    if (person.daysUntil === 0) return 'Hoy';
                    if (person.daysUntil === 1) return 'Mañana';
                    return `En ${person.daysUntil} días`;
                  })();

                  return (
                    <div key={person.id} className={`p-4 rounded-lg border ${isToday ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white">{person.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{person.type}</p>
                          {person.celulaName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {person.type === 'Miembro' ? `Célula: ${person.celulaName}` : person.celulaName}
                            </p>
                          )}
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              person.daysUntil === 0 
                                ? 'bg-pink-500 text-white' 
                                : person.daysUntil === 1
                                ? 'bg-purple-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}>
                              {daysLabel}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className={`block text-lg font-bold ${isToday ? 'text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                            {dobParts ? dobParts.day : ''}
                          </span>
                          <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
                            {dobParts ? ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][dobParts.month-1] : ''}
                          </span>
                        </div>
                      </div>
                      {isToday && (
                        <div className="mt-3 text-center">
                          <span className="inline-block px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
                            ¡Es hoy!
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No hay cumpleaños cercanos</h3>
                <p className="text-gray-500 dark:text-gray-400">No se encontraron cumpleaños en los próximos 7 días.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal de confirmación para eliminar líder */}
        {showDeleteLider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Eliminar Líder</h3>
                <button onClick={() => setShowDeleteLider(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mb-6 text-gray-700 dark:text-gray-300">¿Estás seguro de que deseas eliminar este líder? Esta acción no se puede deshacer.</p>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={confirmDeleteLider}
                  className="btn btn-danger flex-1"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setShowDeleteLider(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Líder */}
        {showEditLider && editingLider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Editar Líder</h3>
                <button onClick={() => setShowEditLider(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={editingLider.name}
                    onChange={(e) => setEditingLider({ ...editingLider, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingLider.email}
                    onChange={(e) => setEditingLider({ ...editingLider, email: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={editingLider.fechaNacimiento || ''}
                    onChange={(e) => setEditingLider({ ...editingLider, fechaNacimiento: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={(editingLider as any).telefono || ''}
                    onChange={(e) => setEditingLider({ ...editingLider, telefono: e.target.value } as any)}
                    className="input"
                    placeholder="Ej: +54 9 11 ..."
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleEditLider}
                  className="btn btn-primary flex-1"
                  disabled={!editingLider.name.trim()}
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => setShowEditLider(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Crear Célula */}
        {showAddCelula && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Crear Nueva Célula</h3>
                <button onClick={() => { setShowAddCelula(false); setColiderSearch(''); }} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Célula *
                  </label>
                  <input
                    type="text"
                    value={newCelula.name}
                    onChange={(e) => setNewCelula({ ...newCelula, name: e.target.value })}
                    className="input"
                    placeholder="Célula Jóvenes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Día de la Semana *
                  </label>
                  <select
                    value={newCelula.diaSemana}
                    onChange={(e) => setNewCelula({ ...newCelula, diaSemana: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccionar día...</option>
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horario *
                  </label>
                  <input
                    type="time"
                    value={newCelula.horario}
                    onChange={(e) => setNewCelula({ ...newCelula, horario: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Asignar Líder Principal *
                  </label>
                  <select
                    value={newCelula.liderId}
                    onChange={(e) => setNewCelula({ ...newCelula, liderId: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccionar líder principal...</option>
                    {lideresDisponibles.map(lider => (
                      <option key={lider.id} value={lider.id}>
                        {lider.name} - {lider.email}
                      </option>
                    ))}
                  </select>
                  {lideresDisponibles.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No hay líderes disponibles. Crea un líder primero.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Colíderes (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar colíder..."
                    value={coliderSearch}
                    onChange={(e) => setColiderSearch(e.target.value)}
                    className="input mb-2 text-sm py-1"
                  />
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {lideresDisponibles
                      .filter(l => l.id !== newCelula.liderId && l.name.toLowerCase().includes(coliderSearch.toLowerCase()))
                      .map(lider => (
                        <label key={lider.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={newCelula.coliderIds.includes(lider.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewCelula({ ...newCelula, coliderIds: [...newCelula.coliderIds, lider.id] });
                              } else {
                                setNewCelula({ ...newCelula, coliderIds: newCelula.coliderIds.filter(id => id !== lider.id) });
                              }
                            }}
                            className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{lider.name}</span>
                        </label>
                      ))}
                    {lideresDisponibles.filter(l => l.id !== newCelula.liderId && l.name.toLowerCase().includes(coliderSearch.toLowerCase())).length === 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                        No se encontraron líderes disponibles
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Selecciona uno o más colíderes para apoyar al líder principal
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddCelula}
                  className="btn btn-primary flex-1"
                  disabled={!newCelula.name.trim() || !newCelula.liderId || !newCelula.diaSemana || !newCelula.horario}
                >
                  Crear Célula
                </button>
                <button
                  onClick={() => { setShowAddCelula(false); setColiderSearch(''); }}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Célula */}
        {showEditCelula && editingCelula && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Editar Célula</h3>
                <button onClick={() => { setShowEditCelula(false); setColiderSearch(''); }} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Célula
                  </label>
                  <input
                    type="text"
                    value={editingCelula.name}
                    onChange={(e) => setEditingCelula({ ...editingCelula, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Día de la Semana
                  </label>
                  <select
                    value={editingCelula.diaSemana}
                    onChange={(e) => setEditingCelula({ ...editingCelula, diaSemana: e.target.value })}
                    className="input"
                  >
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horario
                  </label>
                  <input
                    type="time"
                    value={editingCelula.horario}
                    onChange={(e) => setEditingCelula({ ...editingCelula, horario: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Líder Principal
                  </label>
                  <select
                    value={editingCelula.liderId}
                    onChange={(e) => setEditingCelula({ ...editingCelula, liderId: e.target.value })}
                    className="input"
                  >
                    {/* Incluir el líder actual aunque tenga célula asignada */}
                    {lideres.map(lider => (
                      <option
                        key={lider.id}
                        value={lider.id}
                        disabled={!!lider.celulaAsignada && lider.id !== editingCelula.liderId}
                      >
                        {lider.name} {lider.celulaAsignada && lider.id !== editingCelula.liderId ? '(Ocupado)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Colíderes
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar colíder..."
                    value={coliderSearch}
                    onChange={(e) => setColiderSearch(e.target.value)}
                    className="input mb-2 text-sm py-1"
                  />
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {lideres
                      .filter(l => l.id !== editingCelula.liderId && l.name.toLowerCase().includes(coliderSearch.toLowerCase()))
                      .map(lider => (
                        <label
                          key={lider.id}
                          className={`flex items-center gap-2 cursor-pointer p-2 rounded ${!!lider.celulaAsignada && !editingCelula.coliderIds.includes(lider.id) ? 'opacity-50' : 'hover:bg-gray-50'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={editingCelula.coliderIds.includes(lider.id)}
                            disabled={!!lider.celulaAsignada && !editingCelula.coliderIds.includes(lider.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditingCelula({ ...editingCelula, coliderIds: [...editingCelula.coliderIds, lider.id] });
                              } else {
                                setEditingCelula({ ...editingCelula, coliderIds: editingCelula.coliderIds.filter(id => id !== lider.id) });
                              }
                            }}
                            className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {lider.name} {!!lider.celulaAsignada && !editingCelula.coliderIds.includes(lider.id) ? '(Ocupado)' : ''}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleEditCelula}
                  className="btn btn-primary flex-1"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => { setShowEditCelula(false); setColiderSearch(''); }}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vista Recursos */}
        {view === 'recursos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Cumpleaños */}
              <div className="card">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-pink-400 p-2 rounded-lg">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-pink-900">Cumpleaños</h3>
                      <p className="text-sm text-pink-700">Próximos cumpleaños</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowCumpleanos(true)}
                      className="w-full btn btn-primary"
                    >
                      Ver Cumpleaños
                    </button>
                  </div>
                </div>
              </div>
              {/* Gestión de Materiales */}
              <div className="card">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Materiales</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gestionar mensajes y recursos</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-800 font-medium">{materiales.filter(m => m.activo).length} materiales activos</div>
                    </div>
                    <button
                      onClick={() => setShowMateriales(true)}
                      className="w-full btn btn-primary"
                    >
                      Gestionar Materiales
                    </button>
                  </div>
                </div>
              </div>

              {/* Gestión de Noticias */}
              <div className="card">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <Newspaper className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Noticias</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Anuncios para la iglesia</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-800 font-medium">{noticias.filter(n => n.visible).length} noticias publicadas</div>
                      <div className="text-sm text-green-700">{noticias.filter(n => n.importante && n.visible).length} importantes</div>
                    </div>
                    <button
                      onClick={() => setShowNoticias(true)}
                      className="w-full btn btn-primary"
                    >
                      Gestionar Noticias
                    </button>
                  </div>
                </div>
              </div>

              {/* Configuración de Donaciones */}
              <div className="card">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-500 p-2 rounded-lg">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Donaciones</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Configurar métodos de donación</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-sm text-red-800 font-medium">Alias configurado</div>
                      <div className="text-sm text-red-700 font-mono">{configuracionDonaciones.aliasIglesia}</div>
                    </div>
                    <button
                      onClick={() => setShowDonaciones(true)}
                      className="w-full btn btn-primary"
                    >
                      Configurar Donaciones
                    </button>
                  </div>
                </div>
              </div>

              {/* Peticiones y Situaciones */}
              <div className="card">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Peticiones</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Situaciones importantes</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-sm text-orange-800 font-medium">
                        {peticionesPastor.filter(p => !p.resuelta).length} peticiones pendientes
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPeticiones(true)}
                      className="w-full btn btn-primary"
                    >
                      Ver Peticiones
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <MaterialesModal
        isOpen={showMateriales}
        onClose={() => setShowMateriales(false)}
      />

      <NoticiasModal
        isOpen={showNoticias}
        onClose={() => setShowNoticias(false)}
      />

      <DonacionesModal
        isOpen={showDonaciones}
        onClose={() => setShowDonaciones(false)}
      />

      <PeticionesModal
        isOpen={showPeticiones}
        onClose={() => setShowPeticiones(false)}
        pendientesAsistencia={peticionesPastor}
      />

      <CumpleanosModal
        isOpen={showCumpleanos}
        onClose={() => setShowCumpleanos(false)}
      />
    </div>
  );
};
