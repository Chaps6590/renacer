import React from 'react';

interface OfflineBannerProps {
  message?: string;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ message }) => (
  <div className="fixed top-0 left-0 w-full z-50 bg-red-600 text-white text-center py-3 shadow-lg animate-fade-in">
    {message || 'No tienes conexión a internet. Algunas funciones pueden no estar disponibles.'}
  </div>
);

export default OfflineBanner;
