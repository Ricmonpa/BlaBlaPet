import React from 'react';
import SignalInterpreterTest from '../components/SignalInterpreterTest';

const SignalInterpreterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🐕 Motor de Interpretación Canina
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema de 4 capas que reemplaza la matriz plana por interpretación contextual progresiva
          </p>
        </div>
        
        <SignalInterpreterTest />
        
        {/* Información adicional sobre el sistema */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🔬 Cómo Funciona el Sistema de 4 Capas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Detección Individual</h3>
                    <p className="text-gray-600 text-sm">
                      Identifica cada señal canina observada de forma aislada
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Análisis de Combinaciones</h3>
                    <p className="text-gray-600 text-sm">
                      Busca patrones conocidos que modifican la interpretación
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 text-yellow-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Contexto Situacional</h3>
                    <p className="text-gray-600 text-sm">
                      Considera lugar, interacción y estado previo del perro
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Síntesis Narrativa</h3>
                    <p className="text-gray-600 text-sm">
                      Genera mensaje natural y recomendaciones para el pet parent
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Ventajas del Nuevo Sistema</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• <strong>Precisión:</strong> Las combinaciones tienen mayor peso que señales aisladas</li>
                <li>• <strong>Contexto:</strong> Interpreta según el entorno y situación específica</li>
                <li>• <strong>Narrativa:</strong> Genera mensajes comprensibles para humanos</li>
                <li>• <strong>Confianza:</strong> Calcula nivel de certeza de cada interpretación</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalInterpreterPage;
