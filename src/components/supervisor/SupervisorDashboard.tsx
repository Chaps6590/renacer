import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Navbar } from '../layout/Navbar';
import { HistorialAsistenciasModal } from '../lider/HistorialAsistenciasModal';
import { MaterialesModal } from '../common/MaterialesModal';
import { NoticiasModal } from '../common/NoticiasModal';
import { DonacionesModal } from '../common/DonacionesModal';
import { PeticionesModal } from '../common/PeticionesModal';
import { CumpleanosModal } from '../common/CumpleanosModal';
import { Users, BarChart3, Eye, FileText, Newspaper, Heart, TrendingUp, UserCheck, Bell, X } from 'lucide-react';

const SupervisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { celulas, peticionesPastor, asistencias } = useData();
  const [showHistorial, setShowHistorial] = useState(false);
  const [selectedCelulaId, setSelectedCelulaId] = useState<string | null>(null);
  const [showMateriales, setShowMateriales] = useState(false);
  const [showNoticias, setShowNoticias] = useState(false);
  const [showDonaciones, setShowDonaciones] = useState(false);
  const [showPeticiones, setShowPeticiones] = useState(false);
  const [showEstadisticas, setShowEstadisticas] = useState(false);
  const [showTodosCumpleanos, setShowTodosCumpleanos] = useState(false);

  // Filtrar y ordenar las células que supervisa el usuario
  const misCelulas = celulas
    .filter(c => c.supervisorId === user?.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Calcular estadísticas generales (excluir VISITAS)
  const totalCelulas = misCelulas.length;
  const totalMiembros = misCelulas.reduce((sum, c) => {
    const miembrosSinVisitas = c.miembros.filter(m => m.rolCelula?.toLowerCase() !== 'visita');
    return sum + miembrosSinVisitas.length;
  }, 0);
  
  // Calcular promedio de asistencia de las células supervisadas
  const promedioAsistencia = (() => {
    if (misCelulas.length === 0) return 0;
    
    const promedios = misCelulas.map(celula => {
      const celasAsistencias = asistencias.filter(a => a.celulaId === celula.id);
      
      if (celasAsistencias.length === 0) return 0;
      
      // Calcular porcentaje de cada registro usando totalPresentes y totalAusentes de ESE momento
      // Solo considerar registros donde había miembros (excluir registros con solo visitas)
      const porcentajes = celasAsistencias
        .filter(a => (a.totalPresentes + a.totalAusentes) > 0) // Excluir registros sin miembros
        .map(a => {
          const totalMiembrosEnRegistro = a.totalPresentes + a.totalAusentes;
          return (a.totalPresentes / totalMiembrosEnRegistro) * 100;
        });
      
      if (porcentajes.length === 0) return 0;
      
      return Math.round(porcentajes.reduce((sum, p) => sum + p, 0) / porcentajes.length);
    });
    
    const promediosValidos = promedios.filter(p => p > 0);
    if (promediosValidos.length === 0) return 0;
    
    return Math.round(promediosValidos.reduce((sum, p) => sum + p, 0) / promediosValidos.length);
  })();

  // Peticiones pendientes de mis células supervisadas
  const peticionesPendientes = peticionesPastor.filter(p => !p.resuelta).length;

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

    // Recolectar todos los cumpleaños próximos de las células supervisadas
    const allBirthdays: any[] = [];

    // Miembros de células supervisadas
    misCelulas.forEach(c => {
      c.miembros.forEach(m => {
        const daysUntil = getDaysUntilBirthday(m.fechaNacimiento);
        if (daysUntil !== null) {
          allBirthdays.push({ ...m, type: 'Miembro', celulaName: c.name, liderName: c.liderName, daysUntil });
        }
      });
    });

    // Líderes de células supervisadas
    misCelulas.forEach(c => {
      const daysUntil = getDaysUntilBirthday(c.liderFechaNacimiento);
      if (daysUntil !== null) {
        allBirthdays.push({ 
          id: c.liderId, 
          name: c.liderName, 
          fechaNacimiento: c.liderFechaNacimiento,
          type: 'Líder', 
          celulaName: c.name, 
          daysUntil 
        });
      }
    });

    // Colíderes de células supervisadas
    misCelulas.forEach(c => {
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

  const handleVerHistorial = (celulaId: string) => {
    setSelectedCelulaId(celulaId);
    setShowHistorial(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Panel de Supervisor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bienvenido, {user?.name} - Supervisando {totalCelulas} {totalCelulas === 1 ? 'célula' : 'células'}
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Células</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalCelulas}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Miembros</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalMiembros}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Excluye visitas</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <UserCheck className="w-8 h-8 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 ${
            promedioAsistencia >= 80 ? 'border-purple-500' :
            promedioAsistencia >= 60 ? 'border-yellow-500' :
            promedioAsistencia > 0 ? 'border-red-500' : 'border-gray-400'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Asistencia</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{promedioAsistencia}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Promedio general</p>
              </div>
              <div className={`p-3 rounded-lg ${
                promedioAsistencia >= 80 ? 'bg-purple-100 dark:bg-purple-900' :
                promedioAsistencia >= 60 ? 'bg-yellow-100 dark:bg-yellow-900' :
                promedioAsistencia > 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <TrendingUp className={`w-8 h-8 ${
                  promedioAsistencia >= 80 ? 'text-purple-600 dark:text-purple-300' :
                  promedioAsistencia >= 60 ? 'text-yellow-600 dark:text-yellow-300' :
                  promedioAsistencia > 0 ? 'text-red-600 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'
                }`} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Peticiones</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{peticionesPendientes}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Bell className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cumpleaños</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl">🎂</span>
                  {(() => {
                    const cumpleanosHoy = birthdays.filter(b => b.daysUntil === 0).length;
                    return cumpleanosHoy > 0 ? (
                      <span className="bg-pink-500 text-white rounded-full px-3 py-1 text-lg font-bold shadow">{cumpleanosHoy}</span>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{birthdays.length}</span>
                    );
                  })()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Próximos 7 días</p>
              </div>
              <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-lg">
                <Heart className="w-8 h-8 text-pink-600 dark:text-pink-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setShowPeticiones(true)}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl p-4 flex items-center gap-3 transition-all shadow-lg hover:shadow-xl relative"
          >
            <Bell className="w-6 h-6" />
            <span className="font-semibold">Peticiones</span>
            {peticionesPendientes > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {peticionesPendientes}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowNoticias(true)}
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-4 flex items-center gap-3 transition-all shadow-lg hover:shadow-xl"
          >
            <Newspaper className="w-6 h-6" />
            <span className="font-semibold">Ver Noticias</span>
          </button>

          <button
            onClick={() => setShowMateriales(true)}
            className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-4 flex items-center gap-3 transition-all shadow-lg hover:shadow-xl"
          >
            <FileText className="w-6 h-6" />
            <span className="font-semibold">Materiales</span>
          </button>

          <button
            onClick={() => setShowDonaciones(true)}
            className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-4 flex items-center gap-3 transition-all shadow-lg hover:shadow-xl"
          >
            <Heart className="w-6 h-6" />
            <span className="font-semibold">Ofrendar</span>
          </button>

          <button
            onClick={() => setShowEstadisticas(true)}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl p-4 flex items-center gap-3 transition-all shadow-lg hover:shadow-xl"
          >
            <BarChart3 className="w-6 h-6" />
            <span className="font-semibold">Estadísticas</span>
          </button>
        </div>

        {/* Cumpleaños próximos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cumpleaños Próximos</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Próximos 7 días en tus células supervisadas</p>
            </div>
            <button
              onClick={() => setShowTodosCumpleanos(true)}
              className="btn btn-primary sm:w-auto"
            >
              Ver todos
            </button>
          </div>

          {birthdays.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">No hay cumpleaños cercanos.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {birthdays.slice(0, 6).map((person: any, idx: number) => (
                <div key={`${person.id || person.name}-${idx}`} className="border border-pink-100 dark:border-pink-900 rounded-lg p-3 bg-pink-50/50 dark:bg-pink-900/10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{person.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{person.type} • {person.celulaName}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-pink-500 text-white">
                      {person.daysUntil === 0 ? 'Hoy' : person.daysUntil === 1 ? 'Mañana' : `En ${person.daysUntil} días`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Células */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Células Supervisadas
            </h2>
          </div>

          {misCelulas.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No tienes células asignadas</p>
              <p className="text-sm mt-2">Contacta al pastor para que te asignen células a supervisar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {misCelulas.map((celula) => (
                <div
                  key={celula.id}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{celula.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {celula.diaSemana} • {celula.horario}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Líder:</span>
                          <span className="text-gray-600 dark:text-gray-400">{celula.liderName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Miembros:</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {celula.miembros.filter(m => m.rolCelula?.toLowerCase() !== 'visita').length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Colíderes:</span>
                          <span className="text-gray-600 dark:text-gray-400">{celula.coLideres.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleVerHistorial(celula.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Historial
                      </button>
                    </div>
                  </div>

                  {/* Lista de miembros (colapsable o siempre visible) */}
                  {celula.miembros.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Miembros de la célula:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {celula.miembros.slice(0, 8).map((miembro) => (
                          <div
                            key={miembro.id}
                            className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg"
                          >
                            {miembro.name}
                          </div>
                        ))}
                        {celula.miembros.length > 8 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1">
                            +{celula.miembros.length - 8} más
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showHistorial && selectedCelulaId && (
        <HistorialAsistenciasModal
          celulaId={selectedCelulaId}
          isOpen={showHistorial}
          onClose={() => {
            setShowHistorial(false);
            setSelectedCelulaId(null);
          }}
          readOnly={true}
        />
      )}

      {showPeticiones && <PeticionesModal isOpen={showPeticiones} onClose={() => setShowPeticiones(false)} pendientesAsistencia={peticionesPastor} />}
      {showMateriales && <MaterialesModal isOpen={showMateriales} onClose={() => setShowMateriales(false)} />}
      {showNoticias && <NoticiasModal isOpen={showNoticias} onClose={() => setShowNoticias(false)} />}
      {showDonaciones && <DonacionesModal isOpen={showDonaciones} onClose={() => setShowDonaciones(false)} />}
      {showTodosCumpleanos && <CumpleanosModal isOpen={showTodosCumpleanos} onClose={() => setShowTodosCumpleanos(false)} />}

      {/* Modal de Estadísticas */}
      {showEstadisticas && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Estadísticas de Células</h3>
                  <p className="text-indigo-100 text-xs uppercase tracking-wider font-semibold">Reporte detallado</p>
                </div>
              </div>
              <button
                onClick={() => setShowEstadisticas(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Célula</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Líder</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Miembros</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Registros</th>
                      <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misCelulas.map(celula => {
                      const celasAsistencias = asistencias.filter(a => a.celulaId === celula.id);
                      const miembrosSinVisitas = celula.miembros.filter(m => m.rolCelula?.toLowerCase() !== 'visita');
                      const totalMiembrosCelula = miembrosSinVisitas.length;
                      
                      // Calcular promedio usando totalPresentes y totalAusentes de cada registro histórico
                      // Solo considerar registros donde había miembros (excluir registros con solo visitas)
                      const promedio = celasAsistencias.length > 0 ? (() => {
                        const porcentajes = celasAsistencias
                          .filter(a => (a.totalPresentes + a.totalAusentes) > 0) // Excluir registros sin miembros
                          .map(a => {
                            const totalMiembrosEnRegistro = a.totalPresentes + a.totalAusentes;
                            return (a.totalPresentes / totalMiembrosEnRegistro) * 100;
                          });
                        return porcentajes.length > 0 
                          ? Math.round(porcentajes.reduce((sum, p) => sum + p, 0) / porcentajes.length)
                          : 0;
                      })() : 0;

                      return (
                        <tr key={celula.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-900 dark:text-white">{celula.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{celula.diaSemana} • {celula.horario}</div>
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{celula.liderName}</td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                              {totalMiembrosCelula}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">
                              {celasAsistencias.length}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm ${
                              celasAsistencias.length === 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' :
                              promedio >= 80 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                              promedio >= 60 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                              'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            }`}>
                              {celasAsistencias.length > 0 ? `${promedio}%` : 'Sin datos'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Resumen */}
              <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Resumen General</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Células</p>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalCelulas}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Miembros</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalMiembros}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Células con Datos</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {misCelulas.filter(c => asistencias.some(a => a.celulaId === c.id)).length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Promedio Global</p>
                    <p className={`text-3xl font-bold ${
                      promedioAsistencia >= 80 ? 'text-green-600 dark:text-green-400' :
                      promedioAsistencia >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                      promedioAsistencia > 0 ? 'text-red-600 dark:text-red-400' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {promedioAsistencia}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => setShowEstadisticas(false)}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
