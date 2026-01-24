import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Users, BarChart3, UserPlus, Download, TrendingUp, Plus, Edit2, X, CheckCircle2, XCircle, FileText, Newspaper, Heart, AlertCircle } from 'lucide-react';
import { Navbar } from '../layout/Navbar';
import { MaterialesModal } from '../common/MaterialesModal';
import { NoticiasModal } from '../common/NoticiasModal';
import { DonacionesModal } from '../common/DonacionesModal';
import { PeticionesModal } from '../common/PeticionesModal';
import { User } from '../../types';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Lider extends User {
  celulaAsignada?: string;
  nombreCelula?: string;
}

export const PastorDashboard: React.FC = () => {
  const { celulas, asistencias, noticias, materiales, configuracionDonaciones, recargarCelulas } = useData();
  const [view, setView] = useState<'dashboard' | 'lideres' | 'celulas' | 'recursos'>('dashboard');
  
  // Estados para modales de recursos
  const [showMateriales, setShowMateriales] = useState(false);
  const [showNoticias, setShowNoticias] = useState(false);
  const [showDonaciones, setShowDonaciones] = useState(false);
  const [showPeticiones, setShowPeticiones] = useState(false);
  
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
          c.colideres.some(col => col.id === lider.id)
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
  const [newLider, setNewLider] = useState({ name: '', email: '' });
  
  // Estado para células
  const [showAddCelula, setShowAddCelula] = useState(false);
  const [newCelula, setNewCelula] = useState({ name: '', liderId: '', diaSemana: '', horario: '', coliderIds: [] as string[] });
  
  const [timeframe, setTimeframe] = useState<'semanal' | 'mensual' | 'anual'>('semanal');

  // Función para agregar líder
  const handleAddLider = async () => {
    if (!newLider.name.trim()) return;
    try {
      const liderData = {
        name: newLider.name,
        email: newLider.email || `${newLider.name.toLowerCase().replace(/\s+/g, '.')}@renacer.com`,
        password: 'Renacer', // Contraseña por defecto
        role: 'LIDER',
      };
      await api.createUser(liderData);
      setNewLider({ name: '', email: '' });
      setShowAddLider(false);
      // Refrescar lista de líderes
      await enrichLideresWithCelulas();
    } catch (error: any) {
      console.error('Error creando líder:', error);
      alert(error.message || 'Error al crear el líder');
    }
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
      
      alert('Célula creada exitosamente');
    } catch (error: any) {
      console.error('Error creando célula:', error);
      alert(error.message || 'Error al crear la célula');
    }
  };

  // Obtener líderes sin célula
  const lideresDisponibles = lideres.filter(l => !l.celulaAsignada);

  const getEstadisticas = () => {
    return celulas.map(celula => {
      const celasAsistencias = asistencias.filter(a => a.celulaId === celula.id);
      const totalMiembros = celula.miembros.length;
      
      const totalPresentes = celasAsistencias.reduce((sum, a) => sum + a.totalPresentes, 0);
      const promedioAsistencia = celasAsistencias.length > 0 
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard del Pastor</h2>
          <p className="text-gray-600">Gestión de células y líderes</p>
        </div>

        {/* Navegación de vistas */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              view === 'dashboard' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('lideres')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              view === 'lideres' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Líderes
          </button>
          <button
            onClick={() => setView('celulas')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              view === 'celulas' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Células
          </button>
          <button
            onClick={() => setView('recursos')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              view === 'recursos' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Recursos
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

              <div 
                className="card bg-gradient-to-br from-orange-500 to-red-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowPeticiones(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Peticiones Altas</p>
                    <p className="text-4xl font-bold">
                      {asistencias.reduce((count, asistencia) => {
                        return count + asistencia.miembros.filter(m => 
                          m.prioridadAnotacion === 'alta' && 
                          (m.anotacionEspecial || m.motivoFalta)
                        ).length;
                      }, 0)}
                    </p>
                    <p className="text-orange-200 text-xs">Click para ver</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-gray-700">Período:</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="input py-2"
                >
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Célula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Líder
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miembros
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asistencias
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estadisticas.map((est) => (
                      <tr key={est.celulaId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{est.celulaNombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{est.liderNombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{est.totalMiembros}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{est.cantidadAsistencias}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            est.promedioAsistencia >= 80 ? 'bg-green-100 text-green-800' :
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
                <h3 className="text-xl font-bold text-gray-800">Gestión de Líderes</h3>
                <p className="text-gray-600 text-sm">Total: {lideres.length} líderes</p>
              </div>
              <button
                onClick={() => setShowAddLider(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Agregar Líder
              </button>
            </div>

            {/* Líderes sin célula */}
            {lideresDisponibles.length > 0 && (
              <div className="card mb-6 bg-amber-50 border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-900">Líderes sin célula asignada ({lideresDisponibles.length})</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lideresDisponibles.map(lider => (
                    <div key={lider.id} className="bg-white p-4 rounded-lg border border-amber-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{lider.name}</p>
                          <p className="text-sm text-gray-600">{lider.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {lider.isRegistered ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3 h-3" />
                                Registrado
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-500">
                                <XCircle className="w-3 h-3" />
                                Pendiente registro
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabla de líderes */}
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-4">Todos los Líderes</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Célula
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Contraseña
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lideres.map((lider) => (
                      <tr key={lider.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{lider.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{lider.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {lider.nombreCelula ? (
                            <span className="text-sm text-gray-900">{lider.nombreCelula}</span>
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
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">Renacer</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Vista Células */}
        {view === 'celulas' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Gestión de Células</h3>
                <p className="text-gray-600 text-sm">Total: {celulas.length} células</p>
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
                      <h4 className="text-lg font-bold text-gray-900">{celula.name}</h4>
                      <p className="text-sm text-gray-600">Líder: {celula.liderName}</p>
                      <p className="text-sm text-blue-600 font-medium mt-1">
                        {celula.diaSemana} - {celula.horario}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Miembros:</span>
                      <span className="font-semibold">{celula.miembros.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Colíderes:</span>
                      <span className="font-semibold">{celula.colideres.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Creada:</span>
                      <span className="font-semibold">
                        {new Date(celula.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal Agregar Líder */}
        {showAddLider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Agregar Nuevo Líder</h3>
                <button onClick={() => setShowAddLider(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    value={newLider.email}
                    onChange={(e) => setNewLider({ ...newLider, email: e.target.value })}
                    className="input"
                    placeholder="juan@email.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si no se ingresa, se generará automáticamente
                  </p>
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

        {/* Modal Crear Célula */}
        {showAddCelula && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Crear Nueva Célula</h3>
                <button onClick={() => setShowAddCelula(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colíderes (opcional)
                  </label>
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {lideresDisponibles.filter(l => l.id !== newCelula.liderId).map(lider => (
                      <label key={lider.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
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
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{lider.name}</span>
                      </label>
                    ))}
                    {lideresDisponibles.filter(l => l.id !== newCelula.liderId).length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        No hay más líderes disponibles para agregar como colíderes
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
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
                  onClick={() => setShowAddCelula(false)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Gestión de Materiales */}
              <div className="card">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Materiales</h3>
                      <p className="text-sm text-gray-600">Gestionar mensajes y recursos</p>
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
                      <h3 className="text-lg font-semibold text-gray-900">Noticias</h3>
                      <p className="text-sm text-gray-600">Anuncios para la iglesia</p>
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
                      <h3 className="text-lg font-semibold text-gray-900">Donaciones</h3>
                      <p className="text-sm text-gray-600">Configurar métodos de donación</p>
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
                      <h3 className="text-lg font-semibold text-gray-900">Peticiones</h3>
                      <p className="text-sm text-gray-600">Situaciones importantes</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-sm text-orange-800 font-medium">
                        {asistencias.reduce((count, asistencia) => {
                          return count + asistencia.miembros.filter(m => 
                            m.prioridadAnotacion === 'alta' && 
                            (m.anotacionEspecial || m.motivoFalta)
                          ).length;
                        }, 0)} prioridad alta
                      </div>
                      <div className="text-sm text-orange-700">
                        {asistencias.reduce((count, asistencia) => {
                          return count + asistencia.miembros.filter(m => 
                            m.prioridadAnotacion && 
                            (m.anotacionEspecial || m.motivoFalta)
                          ).length;
                        }, 0)} total
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
      />
    </div>
  );
};
