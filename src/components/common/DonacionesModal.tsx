import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, Copy, Settings, DollarSign, CheckCircle, X } from 'lucide-react';

interface DonacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonacionesModal: React.FC<DonacionesModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { configuracionDonaciones, actualizarConfiguracionDonaciones } = useData();
  const [mostrandoConfiguracion, setMostrandoConfiguracion] = useState(false);
  const [nuevaConfiguracion, setNuevaConfiguracion] = useState({
    aliasIglesia: configuracionDonaciones.aliasIglesia,
    cbu: configuracionDonaciones.cbu || '',
    descripcion: configuracionDonaciones.descripcion
  });
  const [copiado, setCopiado] = useState(false);

  // Sincronizar estado local con el contexto cuando se abre la configuración o cambia el contexto
  React.useEffect(() => {
    setNuevaConfiguracion({
      aliasIglesia: configuracionDonaciones.aliasIglesia,
      cbu: configuracionDonaciones.cbu || '',
      descripcion: configuracionDonaciones.descripcion
    });
  }, [configuracionDonaciones, mostrandoConfiguracion]);

  if (!isOpen) return null;

  const esAdministrador = user?.role === 'admin' || user?.role === 'pastor';

  const copiarAlias = async () => {
    try {
      await navigator.clipboard.writeText(configuracionDonaciones.aliasIglesia);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = configuracionDonaciones.aliasIglesia;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleActualizarConfiguracion = async () => {
    if (!nuevaConfiguracion.aliasIglesia.trim()) {
      alert('El alias de la iglesia es obligatorio');
      return;
    }

    try {
      await actualizarConfiguracionDonaciones({
        aliasIglesia: nuevaConfiguracion.aliasIglesia.trim(),
        cbu: nuevaConfiguracion.cbu.trim(),
        descripcion: nuevaConfiguracion.descripcion.trim(),
        actualizadoPor: user?.id || ''
      });

      setMostrandoConfiguracion(false);
      alert('Configuración actualizada exitosamente');
    } catch (error: any) {
      alert(error.message || 'Error al actualizar configuración');
    }
  };

  const cancelarConfiguracion = () => {
    setNuevaConfiguracion({
      aliasIglesia: configuracionDonaciones.aliasIglesia,
      cbu: configuracionDonaciones.cbu || '',
      descripcion: configuracionDonaciones.descripcion
    });
    setMostrandoConfiguracion(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-600" />
            Donaciones
          </h3>
          <div className="flex items-center gap-2">
            {esAdministrador && (
              <button
                onClick={() => setMostrandoConfiguracion(!mostrandoConfiguracion)}
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurar
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

        {/* Formulario de configuración */}
        {mostrandoConfiguracion && esAdministrador && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-4">Configuración de Donaciones</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alias de la Iglesia *
                </label>
                <input
                  type="text"
                  value={nuevaConfiguracion.aliasIglesia}
                  onChange={(e) => setNuevaConfiguracion({ ...nuevaConfiguracion, aliasIglesia: e.target.value })}
                  placeholder="Ej: IGLESIA.RENACER.MP"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CBU de la Iglesia (opcional)
                </label>
                <input
                  type="text"
                  value={nuevaConfiguracion.cbu}
                  onChange={(e) => setNuevaConfiguracion({ ...nuevaConfiguracion, cbu: e.target.value })}
                  placeholder="22 dígitos"
                  maxLength={22}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={nuevaConfiguracion.descripcion}
                  onChange={(e) => setNuevaConfiguracion({ ...nuevaConfiguracion, descripcion: e.target.value })}
                  placeholder="Descripción para las donaciones..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleActualizarConfiguracion}
                  className="btn btn-primary"
                >
                  Guardar Configuración
                </button>
                <button
                  onClick={cancelarConfiguracion}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información de donaciones */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Apoya nuestra Iglesia</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">
              {configuracionDonaciones.descripcion || 'Gracias por tu generosidad. Tu apoyo nos permite seguir creciendo y ayudando a más personas.'}
            </p>

            <div className="bg-white dark:bg-gray-800 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Alias para transferencias:</span>
                {configuracionDonaciones.aliasIglesia && (
                  <button
                    onClick={copiarAlias}
                    className={`btn btn-sm transition-all duration-200 ${copiado
                      ? 'btn-success'
                      : 'btn-primary'
                      }`}
                  >
                    {copiado ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="text-center">
                <div className={`text-2xl font-bold font-mono py-3 px-4 rounded border ${configuracionDonaciones.aliasIglesia ? 'text-gray-900 bg-gray-50' : 'text-gray-400 bg-gray-100 italic'}`}>
                  {configuracionDonaciones.aliasIglesia || 'Sin alias configurado'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Cómo donar</span>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <p>1. Abre tu app bancaria o billetera digital</p>
              <p>2. Selecciona "Transferir" o "Enviar dinero"</p>
              <p>3. Ingresa el alias: <span className="font-mono font-bold">{configuracionDonaciones.aliasIglesia}</span></p>
              <p>4. Confirma la transferencia</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
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