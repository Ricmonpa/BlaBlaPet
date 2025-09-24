import React from 'react';

const ErrorHandler = ({ error, onRetry, onDismiss }) => {
  const getErrorMessage = (error) => {
    if (!error) return 'Error desconocido';
    
    const message = error.message || error.toString();
    
    // Errores específicos de cuota de API
    if (message.includes('quota') || message.includes('429')) {
      return {
        title: 'Cuota de API Excedida',
        message: 'Has alcanzado el límite diario de análisis de Gemini API. Intenta de nuevo mañana o considera actualizar tu plan.',
        type: 'warning',
        showRetry: false
      };
    }
    
    // Errores de blob URL expirada
    if (message.includes('blob') && message.includes('ERR_FILE_NOT_FOUND')) {
      return {
        title: 'Video Expirado',
        message: 'El video ha expirado. Por favor, sube un nuevo video para generar subtítulos.',
        type: 'error',
        showRetry: true
      };
    }
    
    // Errores de conectividad
    if (message.includes('Failed to fetch') || message.includes('network')) {
      return {
        title: 'Error de Conectividad',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.',
        type: 'error',
        showRetry: true
      };
    }
    
    // Errores de timeout
    if (message.includes('timeout') || message.includes('Timeout')) {
      return {
        title: 'Tiempo de Espera Agotado',
        message: 'El análisis está tomando más tiempo del esperado. Intenta con un video más corto.',
        type: 'warning',
        showRetry: true
      };
    }
    
    // Error genérico
    return {
      title: 'Error en el Análisis',
      message: message,
      type: 'error',
      showRetry: true
    };
  };

  const errorInfo = getErrorMessage(error);

  const getIcon = () => {
    switch (errorInfo.type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getBgColor = () => {
    switch (errorInfo.type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className={`max-w-md w-full mx-4 p-6 rounded-lg border ${getBgColor()}`}>
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">{getIcon()}</span>
          <h3 className="text-lg font-semibold text-gray-900">{errorInfo.title}</h3>
        </div>
        
        <p className="text-gray-700 mb-6">{errorInfo.message}</p>
        
        <div className="flex space-x-3">
          {errorInfo.showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Intentar de Nuevo
            </button>
          )}
          <button
            onClick={onDismiss}
            className={`${errorInfo.showRetry ? 'flex-1' : 'w-full'} bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors`}
          >
            {errorInfo.showRetry ? 'Cancelar' : 'Cerrar'}
          </button>
        </div>
        
        {errorInfo.type === 'warning' && (
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Tip:</strong> Para evitar este problema en el futuro:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Usa videos más cortos (menos de 10 segundos)</li>
              <li>Evita subir múltiples videos en el mismo día</li>
              <li>Considera actualizar tu plan de Gemini API</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorHandler;
