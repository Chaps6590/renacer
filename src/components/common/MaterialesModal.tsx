import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { MaterialCelula } from '../../types';
import { Download, Upload, FileText, Calendar, Trash2, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MaterialesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaterialesModal: React.FC<MaterialesModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { materiales, celulas, subirMaterial, eliminarMaterial } = useData();
  const [mostrandoSubir, setMostrandoSubir] = useState(false);
  const [nuevoMaterial, setNuevoMaterial] = useState({
    titulo: '',
    descripcion: '',
    fechaParaUsar: ''
  });
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [cargandoDescarga, setCargandoDescarga] = useState<string | null>(null);
  const [esGeneral, setEsGeneral] = useState(true);
  const [celulasSeleccionadas, setCelulasSeleccionadas] = useState<string[]>([]);

  if (!isOpen) return null;

  const esPastor = user?.role === 'pastor' || user?.role === 'admin';
  const esSupervisor = user?.role === 'supervisor';
  const puedeSubir = esPastor || esSupervisor;

  // Obtener células según el rol
  const misCelulas = esSupervisor 
    ? celulas.filter(c => c.supervisorId === user?.id)
    : celulas;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setArchivoSeleccionado(file);
    } else {
      alert('Solo se permiten archivos PDF');
    }
  };

  const handleDescargar = async (material: MaterialCelula) => {
    try {
      setCargandoDescarga(material.id);

      const res = await api.descargarMaterial(material.id) as any;
      const materialData = res.material;

      if (!materialData || !materialData.contenidoBase64) {
        throw new Error('No se pudo obtener el contenido del archivo');
      }

      // El contenidoBase64 ya viene con el prefijo "data:application/pdf;base64,..."
      const link = document.createElement('a');
      link.href = materialData.contenidoBase64;
      link.download = materialData.nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el archivo');
    } finally {
      setCargandoDescarga(null);
    }
  };

  const handleSubirMaterial = async () => {
    if (!archivoSeleccionado || !nuevoMaterial.titulo.trim()) {
      alert('Por favor completa el título y selecciona un archivo PDF');
      return;
    }

    // Validar células si es específico
    if (!esGeneral && celulasSeleccionadas.length === 0 && !esSupervisor) {
      alert('Debes seleccionar al menos una célula para material específico');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const contenidoBase64 = reader.result as string;

        const materialData: any = {
          titulo: nuevoMaterial.titulo.trim(),
          descripcion: nuevoMaterial.descripcion.trim(),
          nombreArchivo: archivoSeleccionado.name,
          tipoArchivo: archivoSeleccionado.type,
          tamanoArchivo: archivoSeleccionado.size,
          contenidoBase64: contenidoBase64,
          esGeneral: esSupervisor ? false : esGeneral,
        };

        // Agregar células si no es general
        if (!materialData.esGeneral && celulasSeleccionadas.length > 0) {
          materialData.celulasIds = celulasSeleccionadas;
        }

        await subirMaterial(materialData);

        // Limpiar formulario
        setNuevoMaterial({ titulo: '', descripcion: '', fechaParaUsar: '' });
        setArchivoSeleccionado(null);
        setCelulasSeleccionadas([]);
        setEsGeneral(true);
        setMostrandoSubir(false);
        alert('Material subido exitosamente');
      };
      reader.readAsDataURL(archivoSeleccionado);
    } catch (error) {
      console.error('Error al subir material:', error);
      alert('Error al subir el archivo');
    }
  };

  const materialesActivos = materiales.filter(m => m.activo).sort((a, b) =>
    new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto my-4 sm:my-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <span className="hidden sm:inline">Materiales para Células</span>
            <span className="sm:hidden">Materiales</span>
          </h3>
          <div className="flex items-center gap-2">
            {puedeSubir && (
              <button
                onClick={() => setMostrandoSubir(!mostrandoSubir)}
                className="btn btn-primary flex items-center gap-1 sm:gap-2 text-xs sm:text-base px-2 sm:px-4 py-1.5 sm:py-2"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Subir Material</span>
                <span className="sm:hidden">Subir</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Formulario para subir material */}
        {mostrandoSubir && puedeSubir && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 sm:mb-4 text-sm sm:text-base">
              {esSupervisor ? 'Subir Material para tus Células' : 'Subir Nuevo Material'}
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Título del Material *
                </label>
                <input
                  type="text"
                  value={nuevoMaterial.titulo}
                  onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, titulo: e.target.value })}
                  placeholder="Ej: Mensaje sobre el amor de Dios"
                  className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={nuevoMaterial.descripcion}
                  onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, descripcion: e.target.value })}
                  placeholder="Breve descripción del contenido..."
                  className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none text-sm sm:text-base"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Fecha sugerida para usar (opcional)
                </label>
                <input
                  type="date"
                  value={nuevoMaterial.fechaParaUsar}
                  onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, fechaParaUsar: e.target.value })}
                  className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Archivo PDF *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                />
                {archivoSeleccionado && (
                  <p className="text-xs sm:text-sm text-green-600 mt-2">
                    Archivo seleccionado: {archivoSeleccionado.name}
                  </p>
                )}
              </div>

              {/* Selector de tipo y células */}
              {esPastor && (
                <div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <input
                      type="checkbox"
                      checked={esGeneral}
                      onChange={(e) => {
                        setEsGeneral(e.target.checked);
                        if (e.target.checked) setCelulasSeleccionadas([]);
                      }}
                      className="w-4 h-4"
                    />
                    Material General (visible para todas las células)
                  </label>
                </div>
              )}

              {/* Selector de células (pastor cuando es específico, o supervisor siempre) */}
              {(esSupervisor || (esPastor && !esGeneral)) && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    {esSupervisor 
                      ? 'Células que verán este material (deja vacío para todas tus células)'
                      : 'Seleccionar células *'}
                  </label>
                  <div className="max-h-32 sm:max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-1 sm:space-y-2">
                    {misCelulas.map(celula => (
                      <label key={celula.id} className="flex items-center gap-2 p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={celulasSeleccionadas.includes(celula.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCelulasSeleccionadas([...celulasSeleccionadas, celula.id]);
                            } else {
                              setCelulasSeleccionadas(celulasSeleccionadas.filter(id => id !== celula.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-xs sm:text-sm">{celula.name} - {celula.liderName}</span>
                      </label>
                    ))}
                  </div>
                  {celulasSeleccionadas.length > 0 && (
                    <p className="text-xs sm:text-sm text-blue-600 mt-2">
                      {celulasSeleccionadas.length} {celulasSeleccionadas.length === 1 ? 'célula seleccionada' : 'células seleccionadas'}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleSubirMaterial}
                  className="btn btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Upload className="w-4 h-4" />
                  Subir Material
                </button>
                <button
                  onClick={() => {
                    setMostrandoSubir(false);
                    setNuevoMaterial({ titulo: '', descripcion: '', fechaParaUsar: '' });
                    setArchivoSeleccionado(null);
                    setCelulasSeleccionadas([]);
                    setEsGeneral(true);
                  }}
                  className="btn btn-secondary text-sm sm:text-base"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de materiales */}
        <div className="space-y-3 sm:space-y-4">
          {materialesActivos.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h4 className="text-base sm:text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No hay materiales disponibles
              </h4>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4">
                {puedeSubir
                  ? 'Sube el primer material para compartirlo.'
                  : 'Los materiales aparecerán aquí cuando estén disponibles.'}
              </p>
            </div>
          ) : (
            materialesActivos.map((material) => (
              <div key={material.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{material.titulo}</h4>
                    </div>

                    {material.descripcion && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">{material.descripcion}</p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        Subido: {format(material.fechaSubida, 'dd/MM/yyyy', { locale: es })}
                      </span>
                      {material.fechaParaUsar && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          Para usar: {format(material.fechaParaUsar, 'dd/MM/yyyy', { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-4">
                    <button
                      onClick={() => handleDescargar(material)}
                      disabled={cargandoDescarga === material.id}
                      className="btn btn-primary btn-sm flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial"
                    >
                      {cargandoDescarga === material.id ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="hidden sm:inline">Iniciando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                          Descargar
                        </>
                      )}
                    </button>

                    {(esPastor || (esSupervisor && material.subidoPor?.id === user?.id)) && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${material.titulo}"?`)) {
                            eliminarMaterial(material.id);
                          }
                        }}
                        className="btn btn-danger btn-sm p-1.5 sm:p-2"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="btn btn-secondary text-sm sm:text-base w-full sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};