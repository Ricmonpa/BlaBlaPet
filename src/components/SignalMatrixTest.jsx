import React, { useState, useRef } from 'react';
import GeminiService from '../services/geminiService.js';

const SignalMatrixTest = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisMethod, setAnalysisMethod] = useState('signal-matrix'); // 'original' o 'signal-matrix'
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const geminiService = new GeminiService();

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      console.log('📁 Archivo seleccionado:', file.name, file.type);
      
      // Determinar tipo de media
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      
      // Elegir método de análisis
      let result;
      if (analysisMethod === 'signal-matrix') {
        console.log('🔍 Usando análisis con matriz de señales...');
        result = await geminiService.analyzePetMediaWithSignalMatrix(file, mediaType);
      } else {
        console.log('🔍 Usando análisis original...');
        result = await geminiService.analyzePetMedia(file, mediaType);
      }
      
      setAnalysisResult(result);
      console.log('✅ Resultado del análisis:', result);
      
    } catch (err) {
      console.error('❌ Error en análisis:', err);
      setError(err.message || 'Error durante el análisis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      fileInputRef.current.files = files;
      handleFileSelect({ target: { files } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🧠 Prueba de Análisis con Matriz de Señales
      </h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Selecciona el método de análisis:
        </h3>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="signal-matrix"
              checked={analysisMethod === 'signal-matrix'}
              onChange={(e) => setAnalysisMethod(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">
              🧠 <strong>Matriz de Señales</strong> (Nuevo - Evita catastrophic forgetting)
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="original"
              checked={analysisMethod === 'original'}
              onChange={(e) => setAnalysisMethod(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm">
              🤖 <strong>Análisis Original</strong> (Método anterior)
            </span>
          </label>
        </div>
      </div>

      {/* Área de drop */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-blue-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">
              {analysisMethod === 'signal-matrix' 
                ? '🔍 Analizando con matriz de señales...' 
                : '🤖 Analizando con método original...'
              }
            </p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">📷</div>
            <p className="text-gray-600 mb-2">
              Arrastra una imagen o video aquí, o haz clic para seleccionar
            </p>
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Seleccionar archivo
            </button>
          </div>
        )}
      </div>

      {/* Resultados */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {analysisResult && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">
            📊 Resultados del Análisis
          </h3>
          
          {/* Información del método */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Método Utilizado:</h4>
            <p className="text-blue-700">
              {analysisResult.analysisMethod === 'signal-matrix' 
                ? '🧠 Análisis con Matriz de Señales (Nuevo sistema)'
                : '🤖 Análisis Original (Método anterior)'
              }
            </p>
          </div>

          {/* Traducción */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">🐕 Traducción del Perro:</h4>
            <p className="text-green-700 text-lg italic">
              "{analysisResult.translation}"
            </p>
          </div>

          {/* Detalles técnicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">📈 Confianza:</h4>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${analysisResult.confidence}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{analysisResult.confidence}%</span>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">😊 Emoción Detectada:</h4>
              <p className="text-gray-700 capitalize">{analysisResult.emotion}</p>
            </div>
          </div>

          {/* Comportamiento observado */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">👁️ Comportamiento Observado:</h4>
            <p className="text-yellow-700">{analysisResult.behavior}</p>
          </div>

          {/* Contexto */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">🎭 Contexto:</h4>
            <p className="text-purple-700">{analysisResult.context}</p>
          </div>

          {/* Información adicional para matriz de señales */}
          {analysisResult.analysisMethod === 'signal-matrix' && analysisResult.objectiveDescription && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-800 mb-2">🔬 Descripción Objetiva (Paso 1):</h4>
              <div className="text-sm text-indigo-700 space-y-1">
                {Object.entries(analysisResult.objectiveDescription).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información sobre el sistema */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">ℹ️ Sobre el Sistema de Matriz de Señales:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Paso 1:</strong> Descripción objetiva sin interpretación</li>
          <li>• <strong>Paso 2:</strong> Interpretación usando matriz de 50 señales caninas</li>
          <li>• <strong>Priorización:</strong> Señales de alta prioridad tienen más peso</li>
          <li>• <strong>Conglomerado:</strong> Análisis de múltiples señales juntas</li>
          <li>• <strong>Estabilidad:</strong> Evita el "catastrophic forgetting"</li>
        </ul>
      </div>
    </div>
  );
};

export default SignalMatrixTest;
