import React from 'react';
import AIIntegrationTest from '../components/AIIntegrationTest';

const AIIntegrationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🤖 Integración IA + Motor de 4 Capas
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Sistema avanzado que combina detección automática de señales caninas con interpretación contextual inteligente
          </p>
        </div>
        
        <AIIntegrationTest />
        
        {/* Información adicional sobre la integración */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🚀 Arquitectura de la Integración IA + 4 Capas
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Columna 1: Detección IA */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                    🤖
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Detección Automática</h3>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p><strong>Captura:</strong> Imagen o video del perro</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p><strong>Procesamiento:</strong> Análisis con modelo de IA</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="bg-purple-100 text-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p><strong>Detección:</strong> Señales identificadas automáticamente</p>
                  </div>
                </div>
              </div>
              
              {/* Columna 2: Integración */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                    🔄
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Integración Inteligente</h3>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p><strong>Conecta:</strong> IA → Motor de 4 Capas</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p><strong>Optimiza:</strong> Confianza combinada IA + Contexto</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p><strong>Resultado:</strong> Análisis automático y preciso</p>
                  </div>
                </div>
              </div>
              
              {/* Columna 3: Interpretación */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                    🧠
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Interpretación 4 Capas</h3>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="bg-green-100 text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p><strong>Capa 1:</strong> Procesa señales de IA</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="bg-green-100 text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p><strong>Capa 2:</strong> Analiza combinaciones</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="bg-green-100 text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p><strong>Capa 3:</strong> Aplica contexto</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="bg-green-100 text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      4
                    </div>
                    <p><strong>Capa 4:</strong> Genera narrativa</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Flujo de trabajo */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🔄 Flujo de Trabajo Completo</h3>
              
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg">
                  📸 Captura
                </div>
                <div className="text-gray-500">→</div>
                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg">
                  🤖 IA Detecta
                </div>
                <div className="text-gray-500">→</div>
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  🔄 Integra
                </div>
                <div className="text-gray-500">→</div>
                <div className="bg-green-600 text-white px-4 py-2 rounded-lg">
                  🧠 4 Capas
                </div>
                <div className="text-gray-500">→</div>
                <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
                  💬 Narrativa
                </div>
              </div>
            </div>
            
            {/* Casos de uso */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">🏠 Uso Doméstico</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Monitoreo de comportamiento en casa</li>
                  <li>• Detección de estrés o ansiedad</li>
                  <li>• Análisis de interacciones con familia</li>
                  <li>• Alertas de comportamiento anormal</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🏥 Uso Profesional</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Veterinarios y etólogos</li>
                  <li>• Entrenadores caninos</li>
                  <li>• Refugios y centros de rescate</li>
                  <li>• Investigación científica</li>
                </ul>
              </div>
            </div>
            
            {/* Tecnologías utilizadas */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">🛠️ Tecnologías Implementadas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <strong>Computer Vision</strong>
                  <p className="text-gray-600">Detección automática</p>
                </div>
                <div className="bg-white p-3 rounded text-center">
                  <div className="text-2xl mb-1">🧠</div>
                  <strong>Machine Learning</strong>
                  <p className="text-gray-600">Modelos de IA</p>
                </div>
                <div className="bg-white p-3 rounded text-center">
                  <div className="text-2xl mb-1">🔍</div>
                  <strong>Pattern Recognition</strong>
                  <p className="text-gray-600">Identificación de señales</p>
                </div>
                <div className="bg-white p-3 rounded text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <strong>Contextual Analysis</strong>
                  <p className="text-gray-600">Interpretación inteligente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIntegrationPage;
