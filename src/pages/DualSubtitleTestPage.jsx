import React from 'react';
import DualSubtitleTest from '../components/DualSubtitleTest.jsx';

const DualSubtitleTestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎭 Sistema de Subtítulos Duales
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Prueba el nuevo sistema que genera dos tipos de subtítulos en tiempo real:
            <strong> Traducción Técnica</strong> para análisis detallado y 
            <strong> Doblaje para Pet-Parents</strong> para conectar emocionalmente con los dueños.
          </p>
        </div>
        
        <DualSubtitleTest />
        
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              🚀 Características del Nuevo Sistema
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <span className="mr-2">🔬</span>
                  Traducción Técnica
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Análisis objetivo y detallado del comportamiento canino</li>
                  <li>• Basado en psicología animal y etología</li>
                  <li>• Incluye nombres técnicos de comportamientos</li>
                  <li>• Contexto y significado de cada señal</li>
                  <li>• Ideal para profesionales y análisis detallado</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-800 flex items-center">
                  <span className="mr-2">🎭</span>
                  Doblaje para Pet-Parents
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Traducción emocional y amigable</li>
                  <li>• Como si el perro hablara directamente al dueño</li>
                  <li>• Tono entusiasta, cariñoso y juguetón</li>
                  <li>• Similar a personajes de películas de animación</li>
                  <li>• Conecta emocionalmente con los dueños</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">💡 Proceso de Análisis</h4>
              <div className="text-sm text-green-700 space-y-1">
                <div>1. <strong>Observación:</strong> Identifica señales corporales, posturas y acciones</div>
                <div>2. <strong>Análisis Técnico:</strong> Interpreta cada señal con su significado técnico</div>
                <div>3. <strong>Traducción Emocional:</strong> Convierte en "voz" de perro para el dueño</div>
                <div>4. <strong>Generación:</strong> Entrega ambos outputs de manera clara y separada</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualSubtitleTestPage;
