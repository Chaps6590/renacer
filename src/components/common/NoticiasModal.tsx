import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Noticia } from '../../types';
import { Newspaper, Plus, Trash2, Edit, Eye, EyeOff, AlertCircle, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NoticiasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoticiasModal: React.FC<NoticiasModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { noticias, agregarNoticia, actualizarNoticia, eliminarNoticia } = useData();
  const [mostrandoCrear, setMostrandoCrear] = useState(false);
  const [editandoNoticia, setEditandoNoticia] = useState<Noticia | null>(null);
  const [nuevaNoticia, setNuevaNoticia] = useState({
    titulo: '',
    contenido: '',
    imageUrl: '',
    fechaVencimiento: '',
    importante: false
  });
  const [cargandoImagen, setCargandoImagen] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 1MB para Base64 eficiente)
    if (file.size > 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 1MB.');
      return;
    }

    setCargandoImagen(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNuevaNoticia({ ...nuevaNoticia, imageUrl: reader.result as string });
      setCargandoImagen(false);
    };
    reader.readAsDataURL(file);
  };

  const esPastor = user?.role === 'pastor' || user?.role === 'admin';

  const noticiasVisibles = noticias
    .filter(n => n.visible)
    .filter(n => !n.fechaVencimiento || new Date(n.fechaVencimiento) > new Date())
    .sort((a, b) => {
      // Importantes primero, luego por fecha de creación
      if (a.importante && !b.importante) return -1;
      if (!a.importante && b.importante) return 1;
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
    });

  const handleCrearNoticia = () => {
    if (!nuevaNoticia.titulo.trim() || !nuevaNoticia.contenido.trim()) {
      alert('Por favor completa título y contenido');
      return;
    }

    const noticia: Omit<Noticia, 'id' | 'fechaCreacion'> = {
      titulo: nuevaNoticia.titulo.trim(),
      contenido: nuevaNoticia.contenido.trim(),
      imageUrl: nuevaNoticia.imageUrl,
      fechaVencimiento: nuevaNoticia.fechaVencimiento ? new Date(nuevaNoticia.fechaVencimiento) : undefined,
      importante: nuevaNoticia.importante,
      creadoPor: user?.id || '',
      visible: true
    };

    agregarNoticia(noticia);

    // Limpiar formulario
    setNuevaNoticia({ titulo: '', contenido: '', imageUrl: '', fechaVencimiento: '', importante: false });
    setMostrandoCrear(false);
    alert('Noticia creada exitosamente');
  };

  const handleEditarNoticia = (noticia: Noticia) => {
    setEditandoNoticia(noticia);
    setNuevaNoticia({
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      imageUrl: noticia.imageUrl || '',
      fechaVencimiento: noticia.fechaVencimiento ? format(noticia.fechaVencimiento, 'yyyy-MM-dd') : '',
      importante: noticia.importante
    });
    setMostrandoCrear(true);
  };

  const handleActualizarNoticia = () => {
    if (!editandoNoticia || !nuevaNoticia.titulo.trim() || !nuevaNoticia.contenido.trim()) {
      alert('Por favor completa título y contenido');
      return;
    }

    actualizarNoticia(editandoNoticia.id, {
      titulo: nuevaNoticia.titulo.trim(),
      contenido: nuevaNoticia.contenido.trim(),
      imageUrl: nuevaNoticia.imageUrl,
      fechaVencimiento: nuevaNoticia.fechaVencimiento ? new Date(nuevaNoticia.fechaVencimiento) : undefined,
      importante: nuevaNoticia.importante
    });

    // Limpiar formulario
    setNuevaNoticia({ titulo: '', contenido: '', imageUrl: '', fechaVencimiento: '', importante: false });
    setEditandoNoticia(null);
    setMostrandoCrear(false);
    alert('Noticia actualizada exitosamente');
  };

  const cancelarEdicion = () => {
    setMostrandoCrear(false);
    setEditandoNoticia(null);
    setNuevaNoticia({ titulo: '', contenido: '', imageUrl: '', fechaVencimiento: '', importante: false });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Newspaper className="w-6 h-6 text-blue-600" />
            Noticias de la Iglesia
          </h3>
          <div className="flex items-center gap-2">
            {esPastor && (
              <button
                onClick={() => setMostrandoCrear(!mostrandoCrear)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {editandoNoticia ? 'Editar Noticia' : 'Nueva Noticia'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Formulario para crear/editar noticia */}
        {mostrandoCrear && esPastor && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-4">
              {editandoNoticia ? 'Editar Noticia' : 'Crear Nueva Noticia'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={nuevaNoticia.titulo}
                  onChange={(e) => setNuevaNoticia({ ...nuevaNoticia, titulo: e.target.value })}
                  placeholder="Ej: Conferencia especial este domingo"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenido *
                </label>
                <textarea
                  value={nuevaNoticia.contenido}
                  onChange={(e) => setNuevaNoticia({ ...nuevaNoticia, contenido: e.target.value })}
                  placeholder="Detalle completo de la noticia..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagen (opcional)
                </label>
                <div className="flex items-center gap-4">
                  <div className={`w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700`}>
                    {nuevaNoticia.imageUrl ? (
                      <img src={nuevaNoticia.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                      <Newspaper className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="news-image-upload"
                    />
                    <label
                      htmlFor="news-image-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    >
                      {cargandoImagen ? 'Procesando...' : (nuevaNoticia.imageUrl ? 'Cambiar Imagen' : 'Subir Imagen')}
                    </label>
                    {nuevaNoticia.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setNuevaNoticia({ ...nuevaNoticia, imageUrl: '' })}
                        className="ml-2 text-red-600 text-sm hover:text-red-700"
                      >
                        Quitar
                      </button>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Sube una imagen pequeña (formato cuadrado recomendado, máx 1MB).
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de vencimiento (opcional)
                </label>
                <input
                  type="date"
                  value={nuevaNoticia.fechaVencimiento}
                  onChange={(e) => setNuevaNoticia({ ...nuevaNoticia, fechaVencimiento: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Si se establece, la noticia se ocultará automáticamente después de esta fecha
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="importante"
                  checked={nuevaNoticia.importante}
                  onChange={(e) => setNuevaNoticia({ ...nuevaNoticia, importante: e.target.checked })}
                  className="w-4 h-4 text-red-600"
                />
                <label htmlFor="importante" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Marcar como importante
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={editandoNoticia ? handleActualizarNoticia : handleCrearNoticia}
                  className="btn btn-primary"
                >
                  {editandoNoticia ? 'Actualizar Noticia' : 'Crear Noticia'}
                </button>
                <button
                  onClick={cancelarEdicion}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de noticias */}
        <div className="space-y-4">
          {noticiasVisibles.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No hay noticias disponibles
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                {esPastor
                  ? 'Crea la primera noticia para compartir información con los líderes.'
                  : 'Las noticias aparecerán aquí cuando el pastor las publique.'}
              </p>
            </div>
          ) : (
            noticiasVisibles.map((noticia) => (
              <div
                key={noticia.id}
                className={`border rounded-lg p-4 ${noticia.importante
                  ? 'border-red-300 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {noticia.importante && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <h4 className="font-semibold text-gray-900 dark:text-white">{noticia.titulo}</h4>
                      {noticia.importante && (
                        <span className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full font-medium">
                          Importante
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">{noticia.contenido}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(noticia.fechaCreacion, 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                      {noticia.fechaVencimiento && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Vence: {format(noticia.fechaVencimiento, 'dd/MM/yyyy', { locale: es })}
                        </span>
                      )}
                    </div>
                  </div>

                  {esPastor && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditarNoticia(noticia)}
                        className="btn btn-secondary btn-sm p-2"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          actualizarNoticia(noticia.id, { visible: !noticia.visible });
                        }}
                        className="btn btn-secondary btn-sm p-2"
                        title={noticia.visible ? 'Ocultar' : 'Mostrar'}
                      >
                        {noticia.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${noticia.titulo}"?`)) {
                            eliminarNoticia(noticia.id);
                          }
                        }}
                        className="btn btn-danger btn-sm p-2"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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