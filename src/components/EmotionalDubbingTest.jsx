import React, { useState } from 'react';
import emotionalDubbingService from '../services/emotionalDubbingService.js';

const EmotionalDubbingTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [customTest, setCustomTest] = useState({
    translation: 'Aléjate ¡Juega conmigo ya! Exploración',
    emotion: 'ansioso',
    context: 'alerta_defensiva',
    behavior: 'Postura baja, cola relajada, orejas hacia atrás'
  });

  // Casos de prueba predefinidos
  const predefinedTests = [
    {
      name: 'Perro Feliz Jugando',
      translation: '¡Estoy feliz! Quiero jugar contigo',
      emotion: 'feliz',
      context: 'juego',
      behavior: 'Cola moviéndose, orejas relajadas, boca abierta'
    },
    {
      name: 'Perro Exigiendo Recompensa',
      translation: '¡Dame! ¡Dame! Ya di la pata',
      emotion: 'exigente',
      context: 'recompensa',
      behavior: 'Pata levantada, mirada intensa, boca ligeramente abierta'
    },
    {
      name: 'Perro Ansioso',
      translation: 'Aléjate ¡Juega conmigo ya! Exploración',
      emotion: 'ansioso',
      context: 'alerta_defensiva',
      behavior: 'Postura baja, cola relajada, orejas hacia atrás'
    },
    {
      name: 'Perro Cariñoso',
      translation: 'Te quiero mucho, eres mi mejor amigo',
      emotion: 'cariñoso',
      context: 'social',
      behavior: 'Mirada tierna, cola suave, postura relajada'
    },
    {
      name: 'Perro Juguetón',
      translation: '¡Vamos a correr! ¡Esto será divertido!',
      emotion: 'juguetón',
      context: 'juego',
      behavior: 'Energía alta, movimientos rápidos, cola moviéndose'
    }
  ];

  // Ejecutar prueba predefinida
  const runPredefinedTest = (testCase) => {
    const result = emotionalDubbingService.generateEmotionalDubbing(
      testCase.translation,
      testCase.emotion,
      testCase.context,
      testCase.behavior
    );

    const testResult = {
      ...testCase,
      result,
      timestamp: new Date().toLocaleTimeString()
    };

    setTestResults(prev => [testResult, ...prev]);
  };

  // Ejecutar prueba personalizada
  const runCustomTest = () => {
    const result = emotionalDubbingService.generateEmotionalDubbing(
      customTest.translation,
      customTest.emotion,
      customTest.customContext || customTest.context,
      customTest.behavior
    );

    const testResult = {
      name: 'Prueba Personalizada',
      ...customTest,
      result,
      timestamp: new Date().toLocaleTimeString()
    };

    setTestResults(prev => [testResult, ...prev]);
  };

  // Generar doblaje personalizado
  const generateCustomStyle = () => {
    const styles = ['amigable', 'dramático', 'poético', 'deportivo'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    
    const result = emotionalDubbingService.generateCustomDubbing(
      customTest.translation,
      randomStyle
    );

    const testResult = {
      name: `Estilo Personalizado: ${randomStyle}`,
      translation: customTest.translation,
      customDubbing: result,
      style: randomStyle,
      timestamp: new Date().toLocaleTimeString()
    };

    setTestResults(prev => [testResult, ...prev]);
  };

  // Limpiar resultados
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🎭 Prueba de Doblaje Emocional
        </h1>
        <p className="text-gray-600">
          Prueba el servicio de doblaje emocional que convierte traducciones técnicas en lenguaje más humano
        </p>
      </div>

      {/* Pruebas Predefinidas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🧪 Casos de Prueba Predefinidos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predefinedTests.map((testCase, index) => (
            <button
              key={index}
              onClick={() => runPredefinedTest(testCase)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-left transition-colors"
            >
              <h3 className="font-semibold mb-2">{testCase.name}</h3>
              <p className="text-sm opacity-90 mb-2">{testCase.translation}</p>
              <div className="text-xs opacity-75">
                <span className="bg-blue-600 px-2 py-1 rounded mr-2">
                  {testCase.emotion}
                </span>
                <span className="bg-blue-600 px-2 py-1 rounded">
                  {testCase.context}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Prueba Personalizada */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          ✏️ Prueba Personalizada
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Traducción Técnica
            </label>
            <textarea
              value={customTest.translation}
              onChange={(e) => setCustomTest(prev => ({ ...prev, translation: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Escribe la traducción técnica aquí..."
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emoción
              </label>
              <select
                value={customTest.emotion}
                onChange={(e) => setCustomTest(prev => ({ ...prev, emotion: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="feliz">Feliz</option>
                <option value="ansioso">Ansioso</option>
                <option value="exigente">Exigente</option>
                <option value="insistente">Insistente</option>
                <option value="expectante">Expectante</option>
                <option value="solicitante">Solicitante</option>
                <option value="deseoso">Deseoso</option>
                <option value="defensivo">Defensivo</option>
                <option value="juguetón">Juguetón</option>
                <option value="cariñoso">Cariñoso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contexto
              </label>
              <select
                value={customTest.context}
                onChange={(e) => setCustomTest(prev => ({ ...prev, context: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="juego">Juego</option>
                <option value="alerta_defensiva">Alerta Defensiva</option>
                <option value="exploración">Exploración</option>
                <option value="recompensa">Recompensa</option>
                <option value="social">Social</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={runCustomTest}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🧪 Ejecutar Prueba
          </button>
          <button
            onClick={generateCustomStyle}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🎨 Estilo Personalizado
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            📊 Resultados de las Pruebas
          </h2>
          <button
            onClick={clearResults}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            🗑️ Limpiar
          </button>
        </div>
        
        {testResults.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">🧪</div>
            <p>Ejecuta algunas pruebas para ver los resultados aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{result.name}</h3>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Entrada */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Entrada:</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm"><strong>Traducción:</strong> {result.translation}</p>
                      <p className="text-sm"><strong>Emoción:</strong> {result.emotion}</p>
                      <p className="text-sm"><strong>Contexto:</strong> {result.context}</p>
                      {result.behavior && (
                        <p className="text-sm"><strong>Comportamiento:</strong> {result.behavior}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Salida */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Salida:</h4>
                    <div className="bg-blue-50 p-3 rounded">
                      {result.result ? (
                        <>
                          <p className="text-sm"><strong>Doblaje:</strong> {result.result.emotionalDubbing}</p>
                          <p className="text-sm"><strong>Tono:</strong> {result.result.tone}</p>
                          <p className="text-sm"><strong>Estilo:</strong> {result.result.style}</p>
                          <p className="text-sm"><strong>Confianza:</strong> {result.result.confidence}%</p>
                        </>
                      ) : result.customDubbing ? (
                        <>
                          <p className="text-sm"><strong>Estilo:</strong> {result.style}</p>
                          <p className="text-sm"><strong>Doblaje:</strong> {result.customDubbing}</p>
                        </>
                      ) : (
                        <p className="text-sm text-red-500">Error en el resultado</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionalDubbingTest;
