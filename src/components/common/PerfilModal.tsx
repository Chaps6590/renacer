import React, { useState, useEffect } from 'react';
// Detecta el tipo de dispositivo
function getDeviceType() {
  const ua = navigator.userAgent || navigator.vendor;
  if (/android/i.test(ua)) return 'android';
  // iOS detection: userAgent y no window.MSStream
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/windows|macintosh|linux/i.test(ua)) return 'desktop';
  return 'other';
}

import { X, User, Mail, Lock, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface PerfilModalProps {
  onClose: () => void;
}

export const PerfilModal: React.FC<PerfilModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [showInstallMsg, setShowInstallMsg] = useState(false);
  const [deviceType, setDeviceType] = useState('other');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const dt = getDeviceType();
    setDeviceType(dt);
    
    // Verificar si la app ya está instalada (modo standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    
    if (standalone) {
      console.log('App corriendo en modo standalone (instalada)');
    }

    const handler = (e: any) => {
      e.preventDefault();
      console.log('✅ beforeinstallprompt capturado - puede instalarse');
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Log para debugging
    setTimeout(() => {
      if (!deferredPrompt && !standalone) {
        console.log('⚠️ No se capturó beforeinstallprompt. Posibles razones:');
        console.log('- App ya instalada previamente');
        console.log('- Navegador no compatible');
        console.log('- Criterios PWA no cumplidos');
        console.log('Device type:', dt);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Handler para instalar app
  const handleInstallApp = async () => {
    console.log('🔵 Botón instalar presionado', { 
      deviceType, 
      hayPrompt: !!deferredPrompt,
      isStandalone 
    });
    
    // Si ya está en modo standalone, mostrar mensaje
    if (isStandalone) {
      setMessage({ type: 'success', text: '¡La app ya está instalada! La estás usando ahora.' });
      return;
    }

    // iOS usa instrucciones manuales
    if (deviceType === 'ios') {
      setShowIosInstructions(true);
      return;
    }

    // Si tenemos el prompt, intentar instalar
    if (deferredPrompt) {
      try {
        console.log('📲 Mostrando prompt de instalación...');
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`✅ Resultado: ${outcome}`);
        
        if (outcome === 'accepted') {
          setMessage({ type: 'success', text: '¡App instalada! Busca el ícono "Renacer" en tu pantalla de inicio.' });
        } else {
          setMessage({ type: 'error', text: 'Instalación cancelada' });
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('❌ Error al instalar:', error);
        setShowInstallMsg(true);
      }
    } else {
      console.log('⚠️ No hay prompt disponible');
      setShowInstallMsg(true);
    }
  };

  // Handler para mostrar cómo desinstalar
  const handleShowUninstallInstructions = () => {
    setMessage({ 
      type: 'error', 
      text: 'Para desinstalar: Chrome → Menú (⋮) → Información de la app → Desinstalar' 
    });
  };

  // Estado para información personal
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setMessage(null);

      await api.updateProfile(user.id, {
        name: profileData.name,
        email: profileData.email,
      });

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      
      // Actualizar localStorage
      const updatedUser = { ...user, name: profileData.name, email: profileData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setTimeout(() => {
        window.location.reload(); // Recargar para reflejar cambios
      }, 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);

      setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al cambiar contraseña' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-sky-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Mi Perfil</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </div>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Cambiar Contraseña
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Botón Instalar Aplicación */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleInstallApp}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold shadow hover:from-green-600 hover:to-blue-600 transition"
            >
              <span role="img" aria-label="instalar">📲</span> 
              {isStandalone ? 'App ya instalada' : 'Instalar aplicación'}
            </button>
            
            {/* Indicador de estado para debugging */}
            {!isStandalone && !deferredPrompt && deviceType !== 'ios' && (
              <button
                type="button"
                onClick={handleShowUninstallInstructions}
                className="text-xs text-blue-600 underline hover:text-blue-800"
              >
                ¿No encuentras la app? Ver cómo desinstalar
              </button>
            )}
            
            {!isStandalone && deferredPrompt && (
              <p className="text-xs text-green-600 font-medium">
                ✅ Lista para instalar
              </p>
            )}
          </div>

          {/* Mensaje para iOS */}
          {showIosInstructions && (
            <div className="mb-4 p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              <b>Para instalar en iPhone/iPad:</b><br />
              1. Pulsa el botón <b>Compartir</b> en Safari (<span role="img" aria-label="compartir">⬆️</span>)<br />
              2. Selecciona <b>Agregar a pantalla de inicio</b> (<span role="img" aria-label="home">🏠</span>)<br />
              3. Confirma la instalación.<br />
              <button className="mt-2 underline text-blue-600" onClick={() => setShowIosInstructions(false)}>Cerrar</button>
            </div>
          )}

          {/* Mensaje para otros casos */}
          {showInstallMsg && (
            <div className="mb-4 p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
              <strong>La app podría estar ya instalada:</strong><br /><br />
              <strong>Para buscarla:</strong><br />
              • Desliza hacia arriba en la pantalla de inicio<br />
              • Busca "Renacer" en el cajón de apps<br />
              • O ve a Configuración → Apps → Busca "Renacer"<br /><br />
              <strong>Para reinstalar:</strong><br />
              • Chrome → Menú (⋮) → Información de la app → Desinstalar<br />
              • O escribe en Chrome: <code className="bg-yellow-100 px-1">chrome://apps</code><br />
              <button className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium" onClick={() => setShowInstallMsg(false)}>Entendido</button>
            </div>
          )}

          {/* Información Personal */}
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Rol (solo lectura) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Rol
                </label>
                <input
                  type="text"
                  value={user?.role.toUpperCase()}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-sky-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}

          {/* Cambiar Contraseña */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* Contraseña Actual */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mínimo 6 caracteres</p>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-sky-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="h-5 w-5" />
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
