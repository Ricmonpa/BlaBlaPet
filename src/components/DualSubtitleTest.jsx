import React, { useState, useRef } from 'react';
import translatorService from '../services/translatorService.js';

const DualSubtitleTest = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('dual');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      console.log('📁 Archivo seleccionado:', file.name, file.type);
      
      // Configurar modo de análisis
      translatorService.setAnalysisMode(analysisMode);
      console.log('🎭 Modo de análisis configurado:', analysisMode);
      
      // Determinar tipo de media
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      console.log('📹 Tipo de media:', mediaType);
      
      // Analizar media
      const analysisResult = await translatorService.translateMedia(file, mediaType);
      
      console.log('📊 Resultado del análisis:', analysisResult);
      setResult(analysisResult);
      
    } catch (err) {
      console.error('❌ Error en análisis:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleModeChange = (mode) => {
    setAnalysisMode(mode);
    translatorService.setAnalysisMode(mode);
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎭 Prueba de Subtítulos Duales
      </h2>
      
      {/* Selector de modo de análisis */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modo de Análisis:
        </label>
        <div className="flex gap-4">
          {[
            { value: 'dual', label: '🎭 Dual (Técnico + Emocional)', description: 'Nuevo sistema con dos subtítulos' },
            { value: 'thought', label: '🧠 Modelo de Pensamiento', description: 'Sistema anterior' },
            { value: 'external', label: '🌐 API Externa', description: 'API externa (si está disponible)' }
          ].map((mode) => (
            <label key={mode.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="analysisMode"
                value={mode.value}
                checked={analysisMode === mode.value}
                onChange={() => handleModeChange(mode.value)}
                className="text-blue-600"
              />
              <div>
                <div className="font-medium text-sm">{mode.label}</div>
                <div className="text-xs text-gray-500">{mode.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Selector de archivo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Imagen o Video:
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={isAnalyzing}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Estado de análisis */}
      {isAnalyzing && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 font-medium">
              Analizando {analysisMode === 'dual' ? 'con sistema dual' : 'con sistema anterior'}...
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">❌</span>
            <span className="text-red-700 font-medium">Error:</span>
            <span className="text-red-600">{error}</span>
          </div>
        </div>
      )}

      {/* Resultados */}
      {result && (
        <div className="space-y-6">
          {/* Información del análisis */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Información del Análisis</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Confianza:</span> {result.confidence}%
              </div>
              <div>
                <span className="font-medium">Emoción:</span> {result.emotion}
              </div>
              <div>
                <span className="font-medium">Fuente:</span> {result.source}
              </div>
              <div>
                <span className="font-medium">Tipo:</span> {result.analysisType || 'N/A'}
              </div>
            </div>
          </div>

          {/* Subtítulos Duales (nuevo sistema) */}
          {result.output_tecnico && result.output_emocional && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 text-center">
                🎭 Subtítulos Duales (Nuevo Sistema)
              </h3>
              
              {/* Doblaje para Pet-Parents */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-pink-50 border-l-4 border-orange-400 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-orange-600 text-xl">🎭</span>
                  <h4 className="font-semibold text-orange-800">Doblaje para Pet-Parents</h4>
                </div>
                <p className="text-orange-700 leading-relaxed">
                  {result.output_emocional}
                </p>
                {result.emotion && (
                  <div className="mt-2 text-sm text-orange-600">
                    <span className="font-medium">Tono:</span> {result.emotion}
                  </div>
                )}
              </div>

              {/* Traducción Técnica */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-600 text-xl">🔬</span>
                  <h4 className="font-semibold text-blue-800">Traducción Técnica</h4>
                </div>
                <p className="text-blue-700 leading-relaxed">
                  {result.output_tecnico}
                </p>
              </div>
            </div>
          )}

          {/* Sistema anterior (compatibilidad) */}
          {!result.output_tecnico && result.translation && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-green-600 text-xl">🧠</span>
                <h4 className="font-semibold text-green-800">Traducción (Sistema Anterior)</h4>
              </div>
              <p className="text-green-700 leading-relaxed">
                {result.translation}
              </p>
              {result.emotionalDubbing && (
                <div className="mt-3 p-3 bg-green-100 rounded">
                  <div className="text-sm font-medium text-green-800 mb-1">Doblaje Emocional:</div>
                  <p className="text-green-700">{result.emotionalDubbing}</p>
                </div>
              )}
            </div>
          )}

          {/* Detalles técnicos */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">🔍 Detalles Técnicos</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div><span className="font-medium">Comportamiento:</span> {result.behavior}</div>
              <div><span className="font-medium">Contexto:</span> {result.context}</div>
              {result.pattern && (
                <div><span className="font-medium">Patrón detectado:</span> {result.pattern}</div>
              )}
            </div>
          </div>

          {/* Botón para limpiar */}
          <div className="text-center">
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🗑️ Limpiar Resultados
            </button>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Instrucciones</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Selecciona una imagen o video de un perro</li>
          <li>• Elige el modo de análisis que quieres probar</li>
          <li>• El sistema generará los subtítulos correspondientes</li>
          <li>• <strong>Modo Dual:</strong> Muestra "Traducción Técnica" y "Doblaje para Pet-Parents"</li>
          <li>• <strong>Modo Pensamiento:</strong> Usa el sistema anterior</li>
        </ul>
      </div>
    </div>
  );
};

export default DualSubtitleTest;
