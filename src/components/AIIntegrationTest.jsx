import React, { useState, useEffect } from 'react';
import aiSignalDetectionService from '../services/aiSignalDetectionService';
import signalInterpreterService from '../services/signalInterpreterService';

const AIIntegrationTest = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [interpretationResults, setInterpretationResults] = useState(null);
  const [combinedResults, setCombinedResults] = useState(null);
  const [modelStats, setModelStats] = useState(null);
  const [context, setContext] = useState({
    lugar: 'casa',
    interaccion: 'con humano',
    objeto: 'juguete',
    estado_previo: 'relajado'
  });

  // Inicializar servicio de IA al montar el componente
  useEffect(() => {
    initializeAIService();
  }, []);

  const initializeAIService = async () => {
    setIsProcessing(true);
    try {
      const result = await aiSignalDetectionService.initialize();
      if (result.success) {
        setIsInitialized(true);
        setModelStats(aiSignalDetectionService.getModelStats());
      }
    } catch (error) {
      console.error('Error al inicializar IA:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContextChange = (field, value) => {
    setContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const simulateImageDetection = async () => {
    if (!isInitialized) {
      alert('El servicio de IA no está inicializado');
      return;
    }

    setIsProcessing(true);
    try {
      // Simular imagen (en producción sería una imagen real)
      const mockImageData = `mock_image_${Date.now()}`;
      
      // Detección automática con IA
      const detectionResult = await aiSignalDetectionService.detectSignalsFromImage(mockImageData, context);
      setDetectionResults(detectionResult);

      // Interpretación con motor de 4 capas
      if (detectionResult.success && detectionResult.signals.length > 0) {
        const signalIds = detectionResult.signals.map(signal => signal.id);
        const interpretationResult = signalInterpreterService.interpretSignals(signalIds, context);
        setInterpretationResults(interpretationResult);
      }

      // Resultado combinado
      const combinedResult = await aiSignalDetectionService.detectAndInterpret(mockImageData, context);
      setCombinedResults(combinedResult);

    } catch (error) {
      console.error('Error en detección:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateVideoAnalysis = async () => {
    if (!isInitialized) {
      alert('El servicio de IA no está inicializado');
      return;
    }

    setIsProcessing(true);
    try {
      // Simular frames de video
      const mockFrames = Array.from({ length: 5 }, (_, i) => `frame_${i}_${Date.now()}`);
      
      const videoResult = await aiSignalDetectionService.analyzeSignalSequence(mockFrames, context);
      setDetectionResults(videoResult);
      
      // Interpretar señales dominantes
      if (videoResult.success && videoResult.recommended_signals.length > 0) {
        const signalIds = videoResult.recommended_signals.map(signal => signal.id);
        const interpretationResult = signalInterpreterService.interpretSignals(signalIds, context);
        setInterpretationResults(interpretationResult);
      }

    } catch (error) {
      console.error('Error en análisis de video:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const configureDetection = () => {
    const newConfig = aiSignalDetectionService.configureDetection({
      confidenceThreshold: 0.8,
      maxSignalsPerFrame: 3,
      detectionInterval: 500
    });
    
    if (newConfig.success) {
      setModelStats(aiSignalDetectionService.getModelStats());
      alert('Configuración actualizada');
    }
  };

  const resetResults = () => {
    setDetectionResults(null);
    setInterpretationResults(null);
    setCombinedResults(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-purple-600">
        🤖 Integración IA + Motor de 4 Capas - Prueba
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Control */}
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              🎮 Panel de Control
            </h2>
            
            {/* Estado de IA */}
            <div className="mb-4">
              <h3 className="font-medium text-purple-700 mb-2">Estado del Servicio de IA:</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isInitialized ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isInitialized ? '✅ Inicializado' : '❌ No Inicializado'}
              </div>
            </div>

            {/* Configuración de Contexto */}
            <div className="space-y-3">
              <h3 className="font-medium text-purple-700">Contexto Situacional:</h3>
              
              <div>
                <label className="block text-sm font-medium text-purple-700">Lugar:</label>
                <select
                  value={context.lugar}
                  onChange={(e) => handleContextChange('lugar', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                >
                  <option value="casa">Casa</option>
                  <option value="parque">Parque</option>
                  <option value="veterinario">Veterinario</option>
                  <option value="calle">Calle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700">Interacción:</label>
                <select
                  value={context.interaccion}
                  onChange={(e) => handleContextChange('interaccion', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                >
                  <option value="con humano">Con humano</option>
                  <option value="con perro conocido">Con perro conocido</option>
                  <option value="con perro desconocido">Con perro desconocido</option>
                  <option value="con objeto">Con objeto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700">Objeto:</label>
                <input
                  type="text"
                  value={context.objeto}
                  onChange={(e) => handleContextChange('objeto', e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
                  placeholder="juguete, comida, etc."
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-3 pt-4">
              <button
                onClick={simulateImageDetection}
                disabled={!isInitialized || isProcessing}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? '🔄 Procesando...' : '📸 Detectar en Imagen'}
              </button>
              
              <button
                onClick={simulateVideoAnalysis}
                disabled={!isInitialized || isProcessing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? '🔄 Procesando...' : '🎥 Analizar Video'}
              </button>
              
              <button
                onClick={configureDetection}
                disabled={!isInitialized}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                ⚙️ Configurar Detección
              </button>
              
              <button
                onClick={resetResults}
                className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                🔄 Reset Resultados
              </button>
            </div>
          </div>

          {/* Estadísticas del Modelo */}
          {modelStats && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">📊 Estadísticas del Modelo</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Modelo:</strong> {modelStats.model?.name}</p>
                <p><strong>Versión:</strong> {modelStats.model?.version}</p>
                <p><strong>Precisión:</strong> {(modelStats.model?.accuracy * 100).toFixed(1)}%</p>
                <p><strong>Threshold:</strong> {(modelStats.confidenceThreshold * 100).toFixed(0)}%</p>
                <p><strong>Max Señales:</strong> {modelStats.maxSignalsPerFrame}</p>
                <p><strong>Capacidades:</strong> {modelStats.capabilities?.join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Panel de Detección IA */}
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-800">
              🔍 Detección Automática con IA
            </h2>
            
            {!detectionResults ? (
              <div className="text-center text-gray-500 py-8">
                Ejecuta la detección para ver los resultados de IA
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-medium text-green-700 mb-2">📊 Resumen de Detección</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Total detectadas:</strong> {detectionResults.total_detected || detectionResults.total_frames}</p>
                    <p><strong>Filtradas:</strong> {detectionResults.filtered_count || 'N/A'}</p>
                    <p><strong>Éxito:</strong> {detectionResults.success ? '✅ Sí' : '❌ No'}</p>
                  </div>
                </div>

                {detectionResults.signals && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-green-700 mb-2">🎯 Señales Detectadas</h4>
                    <div className="space-y-2">
                      {detectionResults.signals.map((signal, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                          <p><strong>{signal.nombre}</strong> ({signal.categoria})</p>
                          <p>Confianza: {(signal.confidence * 100).toFixed(1)}%</p>
                          {signal.bounding_box && (
                            <p>Posición: ({signal.bounding_box.x.toFixed(0)}, {signal.bounding_box.y.toFixed(0)})</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detectionResults.temporal_patterns && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-green-700 mb-2">⏰ Análisis Temporal</h4>
                    <div className="text-sm space-y-2">
                      <p><strong>Confianza general:</strong> {(detectionResults.overall_confidence * 100).toFixed(1)}%</p>
                      <p><strong>Señales dominantes:</strong> {detectionResults.temporal_patterns.dominant_signals?.length || 0}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel de Interpretación 4 Capas */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              🧠 Interpretación de 4 Capas
            </h2>
            
            {!interpretationResults ? (
              <div className="text-center text-gray-500 py-8">
                La interpretación aparecerá después de la detección
              </div>
            ) : (
              <div className="space-y-4">
                {interpretationResults.success ? (
                  <>
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium text-blue-700 mb-2">✅ Interpretación Exitosa</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Señales:</strong> {interpretationResults.interpretation.summary.signals_detected}</p>
                        <p><strong>Confianza:</strong> {(interpretationResults.interpretation.summary.confidence * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium text-blue-700 mb-2">💬 Narrativa</h4>
                      <p className="text-sm text-blue-700">{interpretationResults.interpretation.summary.narrative}</p>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-medium text-blue-700 mb-2">💡 Recomendación</h4>
                      <p className="text-sm text-blue-700">{interpretationResults.interpretation.summary.recommendation}</p>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-50 p-3 rounded border">
                    <h4 className="font-medium text-red-700 mb-2">❌ Error en Interpretación</h4>
                    <p className="text-sm text-red-700">{interpretationResults.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Resultados Combinados */}
            {combinedResults && (
              <div className="bg-purple-50 p-3 rounded border mt-4">
                <h4 className="font-medium text-purple-700 mb-2">🔄 Análisis Combinado</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Confianza IA:</strong> {(combinedResults.combined_analysis.ai_confidence * 100).toFixed(1)}%</p>
                  <p><strong>Confianza Interpretación:</strong> {(combinedResults.combined_analysis.interpretation_confidence * 100).toFixed(1)}%</p>
                  <p><strong>Confianza General:</strong> {(combinedResults.combined_analysis.overall_confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🔬 Cómo Funciona la Integración IA + 4 Capas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🤖 Detección Automática con IA</h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• <strong>Visón por Computadora:</strong> Analiza imágenes/video en tiempo real</li>
              <li>• <strong>Detección de Patrones:</strong> Identifica señales caninas automáticamente</li>
              <li>• <strong>Análisis Temporal:</strong> Evalúa evolución de señales en secuencias</li>
              <li>• <strong>Filtrado por Confianza:</strong> Solo señales con alta precisión</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🧠 Motor de 4 Capas</h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• <strong>Capa 1:</strong> Procesa señales detectadas por IA</li>
              <li>• <strong>Capa 2:</strong> Analiza combinaciones y patrones</li>
              <li>• <strong>Capa 3:</strong> Aplica contexto situacional</li>
              <li>• <strong>Capa 4:</strong> Genera narrativa para humanos</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Ventajas de la Integración</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• <strong>Automatización:</strong> No requiere identificación manual de señales</li>
            <li>• <strong>Precisión:</strong> IA + interpretación contextual = mayor exactitud</li>
            <li>• <strong>Tiempo Real:</strong> Análisis instantáneo de comportamiento canino</li>
            <li>• <strong>Escalabilidad:</strong> Puede procesar múltiples perros simultáneamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIIntegrationTest;
