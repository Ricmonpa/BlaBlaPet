import React, { useState } from 'react';
import shareService from '../services/shareService.js';

const ShareModal = ({ isOpen, onClose, post }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [sharingPlatform, setSharingPlatform] = useState(null);

  if (!isOpen) return null;

  const platforms = shareService.getAvailablePlatforms();

  const handleShare = async (platformId) => {
    if (!post) return;

    setIsSharing(true);
    setSharingPlatform(platformId);

    try {
      const success = await shareService.share(platformId, post);
      
      if (success) {
        console.log(`✅ Compartido exitosamente en ${platformId}`);
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        console.log(`❌ Error compartiendo en ${platformId}`);
      }
    } catch (error) {
      console.error('❌ Error en compartir:', error);
    } finally {
      setIsSharing(false);
      setSharingPlatform(null);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Compartir</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSharing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Platform Options */}
        <div className="space-y-3">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handleShare(platform.id)}
              disabled={isSharing}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                isSharing && sharingPlatform === platform.id
                  ? 'bg-gray-100 cursor-not-allowed'
                  : 'hover:bg-gray-50 active:scale-95 hover:shadow-md'
              }`}
            >
              {/* Platform Icon */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: platform.color }}
              >
                {platform.icon}
              </div>

              {/* Platform Info */}
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                <p className="text-sm text-gray-500">
                  {platform.id === 'native' 
                    ? 'Usar apps del sistema' 
                    : `Compartir en ${platform.name}`
                  }
                </p>
              </div>

              {/* Loading Indicator */}
              {isSharing && sharingPlatform === platform.id && (
                <div className="w-6 h-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                </div>
              )}

              {/* Arrow Icon */}
              {!isSharing && (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Post Preview */}
        {post && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {post.petName?.charAt(0) || '🐕'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {post.petName || 'Mi perro'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {post.translation || post.emotionalDubbing || 'Traducción del perro'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            {isSharing 
              ? 'Compartiendo...' 
              : 'Selecciona una plataforma para compartir'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
