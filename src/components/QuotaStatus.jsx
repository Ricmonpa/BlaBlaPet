import React, { useState, useEffect } from 'react';
import cacheService from '../services/cacheService.js';

const QuotaStatus = () => {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    updateStats();
    
    // Actualizar estadísticas cada minuto
    const interval = setInterval(updateStats, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    const currentStats = cacheService.getStats();
    setStats(currentStats);
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = () => {
    if (!stats) return 'text-gray-500';
    
    const percentage = (stats.requestsToday / stats.dailyLimit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (!stats) return 'bg-gray-200';
    
    const percentage = (stats.requestsToday / stats.dailyLimit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!stats) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Botón para mostrar/ocultar */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`mb-2 p-2 rounded-full shadow-lg transition-all ${
          stats.canMakeRequest 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title="Estado de cuota de API"
      >
        {stats.canMakeRequest ? '✅' : '⚠️'}
      </button>

      {/* Panel de estadísticas */}
      {isVisible && (
        <div className="bg-white rounded-lg shadow-lg p-4 min-w-64 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Estado de API</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Requests hoy</span>
              <span className={getStatusColor()}>
                {stats.requestsToday}/{stats.dailyLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor()}`}
                style={{
                  width: `${Math.min((stats.requestsToday / stats.dailyLimit) * 100, 100)}%`
                }}
              />
            </div>
          </div>

          {/* Información detallada */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Restantes:</span>
              <span className={getStatusColor()}>{stats.remainingRequests}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Cache:</span>
              <span className="text-blue-600">{stats.cacheSize} elementos</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Reset en:</span>
              <span className="text-gray-800">{formatTime(stats.timeUntilReset)}</span>
            </div>
          </div>

          {/* Estado de disponibilidad */}
          <div className="mt-3 pt-3 border-t">
            <div className={`text-center font-medium ${
              stats.canMakeRequest ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.canMakeRequest ? '✅ API Disponible' : '⚠️ Límite Alcanzado'}
            </div>
          </div>

          {/* Consejos */}
          {!stats.canMakeRequest && (
            <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
              💡 Tip: La app procesará videos largos automáticamente cuando la cuota se resetee
            </div>
          )}
          
          {stats.canMakeRequest && stats.requestsToday > 20 && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
              ⚡ Procesamiento optimizado activo para videos largos
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuotaStatus;
