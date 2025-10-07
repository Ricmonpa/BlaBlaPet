import React from 'react';

/**
 * Componente para mostrar progreso de compresión de video
 */
const CompressionProgress = ({ 
  isVisible, 
  progress, 
  currentProfile, 
  originalSize, 
  compressedSize, 
  attempts 
}) => {
  if (!isVisible) return null;

  const compressionRatio = originalSize && compressedSize 
    ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
    : 0;

  const getProfileDescription = (profile) => {
    const descriptions = {
      'none': 'Sin compresión necesaria',
      '720p_balanced': '720p - Balance calidad/tamaño',
      '480p_aggressive': '480p - Compresión agresiva',
      '360p_extreme': '360p - Compresión extrema',
      'failed': 'Compresión falló'
    };
    return descriptions[profile] || profile;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div 
                className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin"
                style={{
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent'
                }}
              ></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Optimizando Video
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Comprimiendo video para upload más rápido...
            </p>
          </div>

          {/* Información de compresión */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tamaño original:</span>
                <div className="font-semibold">
                  {originalSize ? `${originalSize.toFixed(1)} MB` : 'Calculando...'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Tamaño final:</span>
                <div className="font-semibold text-green-600">
                  {compressedSize ? `${compressedSize.toFixed(1)} MB` : 'Procesando...'}
                </div>
              </div>
            </div>
            
            {compressionRatio > 0 && (
              <div className="mt-3 text-center">
                <span className="text-sm text-gray-500">Reducción:</span>
                <div className="font-semibold text-blue-600">
                  {compressionRatio}% más pequeño
                </div>
              </div>
            )}
          </div>

          {/* Perfil actual */}
          <div className="mb-4">
            <span className="text-sm text-gray-500">Perfil de compresión:</span>
            <div className="font-semibold text-gray-800">
              {getProfileDescription(currentProfile)}
            </div>
          </div>

          {/* Intentos de compresión */}
          {attempts && attempts.length > 1 && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">Intentos:</span>
              <div className="flex justify-center space-x-2 mt-1">
                {attempts.map((attempt, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      attempt.success 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`}
                    title={`${attempt.profile}: ${attempt.success ? 'Éxito' : 'Falló'}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress || 0}%` }}
            />
          </div>

          {/* Mensaje de estado */}
          <div className="text-sm text-gray-600">
            {progress < 100 ? 'Procesando video...' : '¡Compresión completada!'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompressionProgress;
