import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Users, BarChart3, UserPlus, Download, TrendingUp } from 'lucide-react';
import { Navbar } from '../layout/Navbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const PastorDashboard: React.FC = () => {
  const { celulas, asistencias } = useData();
  const [showAddLider, setShowAddLider] = useState(false);
  const [newLider, setNewLider] = useState({ name: '', email: '' });
  const [timeframe, setTimeframe] = useState<'semanal' | 'mensual' | 'anual'>('semanal');

  const handleAddLider = () => {
    // TODO: Llamar a API para crear líder precargado
    console.log('Crear líder:', newLider);
    setNewLider({ name: '', email: '' });
    setShowAddLider(false);
  };

  const getEstadisticas = () => {
    return celulas.map(celula => {
      const celasAsistencias = asistencias.filter(a => a.celulaId === celula.id);
      const totalMiembros = celula.miembros.length;
      
      // Calcular promedio de asistencia
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

    // Resumen
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
          <p className="text-gray-600">Vista general de todas las células</p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-4xl font-bold">{celulas.length}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowAddLider(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Agregar Líder
          </button>

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

        {/* Modal para agregar líder */}
        {showAddLider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Agregar Nuevo Líder</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
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
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    El líder podrá registrarse buscando su nombre en la página de registro.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddLider}
                  className="btn btn-primary flex-1"
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
      </div>
    </div>
  );
};
