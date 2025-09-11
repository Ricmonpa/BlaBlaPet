import React, { useState } from 'react';
import signalInterpreterService from '../services/signalInterpreterService';

const SignalInterpreterTest = () => {
  const [selectedSignals, setSelectedSignals] = useState([]);
  const [context, setContext] = useState({
    lugar: 'casa',
    interaccion: 'con humano',
    objeto: 'juguete',
    estado_previo: 'relajado'
  });
  const [interpretation, setInterpretation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Señales disponibles para seleccionar
  const availableSignals = signalInterpreterService.getAllSignals();

  const handleSignalToggle = (signalId) => {
    setSelectedSignals(prev => 
      prev.includes(signalId) 
        ? prev.filter(id => id !== signalId)
        : [...prev, signalId]
    );
  };

  const handleContextChange = (field, value) => {
    setContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const runInterpretation = async () => {
    if (selectedSignals.length === 0) {
      alert('Selecciona al menos una señal');
      return;
    }

    setLoading(true);
    
    // Simular procesamiento asíncrono
    setTimeout(() => {
      const result = signalInterpreterService.interpretSignals(selectedSignals, context);
      setInterpretation(result);
      setLoading(false);
    }, 1000);
  };

  const resetTest = () => {
    setSelectedSignals([]);
    setContext({
      lugar: 'casa',
      interaccion: 'con humano',
      objeto: 'juguete',
      estado_previo: 'relajado'
    });
    setInterpretation(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        🐕 Motor de Interpretación de 4 Capas - Prueba
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Configuración */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📋 Configuración de Prueba
            </h2>
            
            {/* Selección de Señales */}
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Señales Detectadas:</h3>
              <div className="max-h-60 overflow-y-auto border rounded p-2 bg-white">
                {availableSignals.map(signal => (
                  <label key={signal.id} className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded">
                    <input
                      type="checkbox"
                      checked={selectedSignals.includes(signal.id)}
                      onChange={() => handleSignalToggle(signal.id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      <span className="font-medium">{signal.nombre}</span>
                      <span className="text-gray-500 ml-2">({signal.categoria})</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Seleccionadas: {selectedSignals.length}
              </p>
            </div>

            {/* Configuración de Contexto */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Contexto Situacional:</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Lugar:</label>
                <select
                  value={context.lugar}
                  onChange={(e) => handleContextChange('lugar', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="casa">Casa</option>
                  <option value="parque">Parque</option>
                  <option value="veterinario">Veterinario</option>
                  <option value="calle">Calle</option>
                  <option value="desconocido">Desconocido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Interacción:</label>
                <select
                  value={context.interaccion}
                  onChange={(e) => handleContextChange('interaccion', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="con humano">Con humano</option>
                  <option value="con perro conocido">Con perro conocido</option>
                  <option value="con perro desconocido">Con perro desconocido</option>
                  <option value="con objeto">Con objeto</option>
                  <option value="solo">Solo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Objeto:</label>
                <input
                  type="text"
                  value={context.objeto}
                  onChange={(e) => handleContextChange('objeto', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="juguete, comida, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Estado Previo:</label>
                <select
                  value={context.estado_previo}
                  onChange={(e) => handleContextChange('estado_previo', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relajado">Relajado</option>
                  <option value="excitado">Excitado</option>
                  <option value="cansado">Cansado</option>
                  <option value="estresado">Estresado</option>
                  <option value="desconocido">Desconocido</option>
                </select>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={runInterpretation}
                disabled={loading || selectedSignals.length === 0}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Procesando...' : '🚀 Ejecutar Interpretación'}
              </button>
              
              <button
                onClick={resetTest}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📊 Resultados de la Interpretación
            </h2>
            
            {!interpretation ? (
              <div className="text-center text-gray-500 py-8">
                Selecciona señales y ejecuta la interpretación para ver los resultados
              </div>
            ) : (
              <div className="space-y-4">
                {interpretation.success ? (
                  <>
                    {/* Resumen */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2">✅ Interpretación Exitosa</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Señales detectadas:</strong> {interpretation.interpretation.summary.signals_detected}</p>
                        <p><strong>Confianza:</strong> {(interpretation.interpretation.summary.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Narrativa */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">💬 Narrativa para el Pet Parent</h3>
                      <p className="text-blue-700">{interpretation.interpretation.summary.narrative}</p>
                    </div>

                    {/* Recomendación */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">💡 Recomendación</h3>
                      <p className="text-yellow-700">{interpretation.interpretation.summary.recommendation}</p>
                    </div>

                    {/* Detalle de Capas */}
                    <div className="bg-gray-100 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-3">🔍 Detalle de las 4 Capas</h3>
                      <div className="space-y-3">
                        {interpretation.interpretation.layers.map((layer, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <h4 className="font-medium text-gray-700 mb-1">
                              Capa {layer.layer}: {layer.description}
                            </h4>
                            <div className="text-sm text-gray-600">
                              {layer.layer === 1 && (
                                <p>Señales: {layer.signals.map(s => s.nombre).join(', ')}</p>
                              )}
                              {layer.layer === 2 && (
                                <p>Combinaciones encontradas: {layer.total_combinations}</p>
                              )}
                              {layer.layer === 3 && (
                                <p>Contexto: {layer.context.lugar} - {layer.context.interaccion}</p>
                              )}
                              {layer.layer === 4 && (
                                <p>Confianza: {(layer.confidence * 100).toFixed(1)}%</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-2">❌ Error en la Interpretación</h3>
                    <p className="text-red-700">{interpretation.error}</p>
                    <p className="text-red-600 mt-2">{interpretation.fallback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalInterpreterTest;
