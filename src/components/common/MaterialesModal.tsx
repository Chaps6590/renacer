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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Materiales para Células
          </h3>
          <div className="flex items-center gap-2">
            {puedeSubir && (
              <button
                onClick={() => setMostrandoSubir(!mostrandoSubir)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Subir Material
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulario para subir material */}
        {mostrandoSubir && puedeSubir && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-4">
              {esSupervisor ? 'Subir Material para tus Células' : 'Subir Nuevo Material'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título del Material *
                </label>
                <input
                  type="text"
                  value={nuevoMaterial.titulo}
                  onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, titulo: e.target.value })}
                  placeholder="Ej: Mensaje sobre el amor de Dios"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={nuevoMaterial.descripcion}
                  onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, descripcion: e.target.value })}
                  placeholder="Breve descripción del contenido..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha sugerida para usar (opcional)
                </label>
                <input
                  type="date"
                  value={nuevoMaterial.fechaParaUsar}
                  onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, fechaParaUsar: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Archivo PDF *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                {archivoSeleccionado && (
                  <p className="text-sm text-green-600 mt-2">
                    Archivo seleccionado: {archivoSeleccionado.name}
                  </p>
                )}
              </div>

              {/* Selector de tipo y células */}
              {esPastor && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {esSupervisor 
                      ? 'Células que verán este material (deja vacío para todas tus células)'
                      : 'Seleccionar células *'}
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 space-y-2">
                    {misCelulas.map(celula => (
                      <label key={celula.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
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
                        <span className="text-sm">{celula.name} - {celula.liderName}</span>
                      </label>
                    ))}
                  </div>
                  {celulasSeleccionadas.length > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                      {celulasSeleccionadas.length} {celulasSeleccionadas.length === 1 ? 'célula seleccionada' : 'células seleccionadas'}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSubirMaterial}
                  className="btn btn-primary flex items-center gap-2"
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
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de materiales */}
        <div className="space-y-4">
          {materialesActivos.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No hay materiales disponibles
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                {puedeSubir
                  ? 'Sube el primer material para compartirlo.'
                  : 'Los materiales aparecerán aquí cuando estén disponibles.'}
              </p>
            </div>
          ) : (
            materialesActivos.map((material) => (
              <div key={material.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">{material.titulo}</h4>
                    </div>

                    {material.descripcion && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{material.descripcion}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Subido: {format(material.fechaSubida, 'dd/MM/yyyy', { locale: es })}
                      </span>
                      {material.fechaParaUsar && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Para usar: {format(material.fechaParaUsar, 'dd/MM/yyyy', { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleDescargar(material)}
                      disabled={cargandoDescarga === material.id}
                      className="btn btn-primary btn-sm flex items-center gap-2"
                    >
                      {cargandoDescarga === material.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Iniciando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Descargar
                        </>
                      )}
                    </button>

                    {esPastor && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${material.titulo}"?`)) {
                            eliminarMaterial(material.id);
                          }
                        }}
                        className="btn btn-danger btn-sm p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};