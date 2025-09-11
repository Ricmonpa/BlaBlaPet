import React, { useState, useRef } from 'react';
import translatorService from '../services/translatorService.js';
import geminiService from '../services/geminiService.js';

const GeminiTest = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Verificar estado del servicio Gemini
  const checkGeminiStatus = async () => {
    try {
      setServiceStatus('Verificando...');
      const isAvailable = await geminiService.checkServiceStatus();
      setServiceStatus(isAvailable ? '✅ Disponible' : '❌ No disponible');
    } catch (error) {
      setServiceStatus('❌ Error de conexión');
      console.error('Error checking Gemini status:', error);
    }
  };

  // Procesar archivo seleccionado
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      console.log(`📁 Archivo seleccionado: ${file.name} (${mediaType})`);

      const analysis = await translatorService.translateMedia(file, mediaType);
      setResult(analysis);
      
      console.log('🎉 Análisis completado:', analysis);
    } catch (error) {
      setError(error.message);
      console.error('❌ Error en análisis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Capturar desde cámara
  const captureFromCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      setError('Error accediendo a la cámara: ' + error.message);
    }
  };

  // Tomar foto desde cámara
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
          const analysis = await translatorService.translateMedia(blob, 'image');
          setResult(analysis);
        } catch (error) {
          setError(error.message);
        } finally {
          setIsAnalyzing(false);
        }
      }, 'image/jpeg');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-[#db195d]">
        🧠 Prueba Gemini IA
      </h2>

      {/* Estado del servicio */}
      <div className="mb-6 p-3 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Estado del Servicio</h3>
        <div className="flex items-center gap-2 mb-2">
          <span>Gemini IA:</span>
          <span className={serviceStatus?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
            {serviceStatus || 'No verificado'}
          </span>
        </div>
        <button
          onClick={checkGeminiStatus}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Verificar Conexión
        </button>
      </div>

      {/* Cámara */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">📷 Cámara</h3>
        <div className="space-y-2">
          <button
            onClick={captureFromCamera}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Activar Cámara
          </button>
          <video
            ref={videoRef}
            className="w-full h-48 bg-gray-200 rounded hidden"
            autoPlay
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          <button
            onClick={takePhoto}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Tomar Foto
          </button>
        </div>
      </div>

      {/* Subir archivo */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">📁 Subir Archivo</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <p className="text-sm text-gray-600 mt-1">
          Soporta imágenes (JPG, PNG) y videos (MP4, WebM)
        </p>
      </div>

      {/* Estado de análisis */}
      {isAnalyzing && (
        <div className="mb-4 p-3 bg-blue-100 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Analizando con Gemini IA...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">🎉 Resultado del Análisis</h3>
          
          <div className="space-y-2 text-sm">
            <div>
              <strong>Traducción:</strong>
              <p className="text-green-700 italic">"{result.translation}"</p>
            </div>
            
            <div>
              <strong>Confianza:</strong>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
                <span className="text-green-700">{result.confidence}%</span>
              </div>
            </div>

            {result.emotion && (
              <div>
                <strong>Emoción:</strong>
                <span className="text-green-700 ml-1">{result.emotion}</span>
              </div>
            )}

            {result.behavior && (
              <div>
                <strong>Comportamiento:</strong>
                <span className="text-green-700 ml-1">{result.behavior}</span>
              </div>
            )}

            {result.context && (
              <div>
                <strong>Contexto:</strong>
                <span className="text-green-700 ml-1">{result.context}</span>
              </div>
            )}

            <div>
              <strong>Fuente:</strong>
              <span className="text-green-700 ml-1 capitalize">{result.source}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiTest;
