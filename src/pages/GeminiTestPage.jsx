import React from 'react';
import GeminiTest from '../components/GeminiTest.jsx';

const GeminiTestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#db195d] to-[#1ca9b1] p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🧠 Fase 2: Gemini IA
          </h1>
          <p className="text-white/90 text-lg">
            Prueba la integración con Google Gemini para análisis de mascotas
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de prueba */}
          <div>
            <GeminiTest />
          </div>

          {/* Información y instrucciones */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-[#db195d] mb-4">
              📋 Instrucciones
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-[#1ca9b1] mb-2">🔑 Configuración</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Obtén tu API key de Google AI Studio</li>
                  <li>En Vercel → Environment Variables agrega <code className="bg-gray-100 px-1 rounded">GEMINI_API_KEY</code> (sin prefijo VITE_, solo server)</li>
                  <li>En local usa <code className="bg-gray-100 px-1 rounded">vercel dev</code> para que exista <code className="bg-gray-100 px-1 rounded">/api/gemini</code></li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-[#1ca9b1] mb-2">🧪 Pruebas</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Verifica la conexión con Gemini</li>
                  <li>Sube una imagen de un perro</li>
                  <li>Usa la cámara para tomar una foto</li>
                  <li>Prueba con videos cortos</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-[#1ca9b1] mb-2">🎯 Funcionalidades</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Análisis de comportamiento canino</li>
                  <li>Traducción divertida y empática</li>
                  <li>Detección de emociones</li>
                  <li>Porcentaje de confianza</li>
                  <li>Contexto sugerido</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">💡 Tip</h3>
                <p className="text-sm text-blue-700">
                  Para mejores resultados, usa fotos claras donde se vea bien la cara y 
                  el lenguaje corporal del perro. Los videos funcionan mejor si son 
                  cortos (5-10 segundos) y muestran una acción específica.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado del proyecto */}
        <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-[#db195d] mb-4">
            📊 Estado del Proyecto
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl mb-2">✅</div>
              <h3 className="font-semibold text-green-800">Fase 1</h3>
              <p className="text-sm text-green-700">UI/UX Base</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl mb-2">🧠</div>
              <h3 className="font-semibold text-blue-800">Fase 2</h3>
              <p className="text-sm text-blue-700">Gemini IA</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold text-gray-800">Fase 3</h3>
              <p className="text-sm text-gray-700">Móviles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiTestPage;
