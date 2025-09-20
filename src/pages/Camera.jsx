import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import translatorService from '../services/translatorService';
import BottomNavigation from '../components/BottomNavigation';

const Camera = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [captureMode, setCaptureMode] = useState('photo'); // 'photo', 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef(null);

  // Configuración de video
  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: "user"
  };

  // Manejar captura de foto
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedMedia({ type: 'photo', data: imageSrc });
      setShowPreview(true);
    }
  }, []);

  // Manejar inicio de grabación
  const startRecording = useCallback(() => {
    if (webcamRef.current && mediaRecorderRef.current) {
      setRecordedChunks([]);
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
    }
  }, []);

  // Manejar fin de grabación
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Configurar MediaRecorder
  const onUserMedia = useCallback((stream) => {
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm'
    });
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setCapturedMedia({ type: 'video', data: videoUrl });
      setShowPreview(true);
    };
  }, [recordedChunks]);

  // Manejar eventos del botón de captura
  const handleCaptureStart = () => {
    if (captureMode === 'photo') {
      capturePhoto();
    } else {
      startRecording();
    }
  };

  const handleCaptureEnd = () => {
    if (captureMode === 'video' && isRecording) {
      stopRecording();
    }
  };

  // Manejar selección de archivo desde galería
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const mediaType = file.type.startsWith('image/') ? 'photo' : 'video';
    
    if (mediaType === 'photo') {
      // Para imágenes, convertir a base64
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedMedia({ type: 'photo', data: e.target.result });
        setShowPreview(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Para videos, crear URL de objeto
      const videoUrl = URL.createObjectURL(file);
      setCapturedMedia({ type: 'video', data: videoUrl });
      setShowPreview(true);
    }
  };

  // Abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Enviar al traductor
  const sendToTranslator = async () => {
    if (!capturedMedia) return;
    
    try {
      // Limpiar errores previos
      setError(null);
      
      // Mostrar indicador de carga
      setCapturing(true);
      
      // Timeout para evitar que se congele (aumentado a 300 segundos para videos largos)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La traducción tardó demasiado')), 300000)
      );
      
      let result;
      
      // Si es un video, usar subtítulos secuenciales
      if (capturedMedia.type === 'video') {
        console.log('🎬 Usando subtítulos secuenciales para video...');
        result = await translatorService.generateSequentialSubtitles(
          capturedMedia.data, 
          capturedMedia.type
        );
        
        // Navegar directamente al home con los subtítulos secuenciales
        if (result && result.success) {
          navigate('/', { 
            state: { 
              // Campos para subtítulos secuenciales
              subtitles: result.subtitles,
              totalDuration: result.totalDuration,
              isSequentialSubtitles: true,
              // Campos existentes para compatibilidad
              translation: result.subtitles[0]?.traduccion_tecnica || 'Análisis de video',
              output_tecnico: result.subtitles[0]?.traduccion_tecnica,
              output_emocional: result.subtitles[0]?.traduccion_emocional,
              media: capturedMedia,
              confidence: result.subtitles[0]?.confidence || 85,
              emotion: 'secuencial',
              behavior: 'análisis por momentos',
              context: 'video con subtítulos secuenciales',
              source: result.source,
              analysisType: 'sequential'
            }
          });
          return;
        }
      } else {
        // Para fotos, usar traducción normal
        console.log('📸 Usando traducción normal para foto...');
        result = await translatorService.translateMedia(
          capturedMedia.data, 
          capturedMedia.type
        );
      }
      
      // Verificar si el resultado es válido
      if (result && (result.success !== false) && (result.translation || result.output_emocional)) {
        // Navegar de vuelta al home con la traducción
        navigate('/', { 
          state: { 
            translation: result.translation,
            // Nuevos campos del análisis dual
            output_tecnico: result.output_tecnico,
            output_emocional: result.output_emocional,
            // Campos existentes
            media: capturedMedia,
            confidence: result.confidence || 80,
            emotion: result.emotion,
            behavior: result.behavior,
            context: result.context,
            source: result.source,
            analysisType: result.analysisType
          }
        });
      } else {
        throw new Error('Error en la traducción: resultado inválido');
      }
    } catch (error) {
      console.error('Error enviando al traductor:', error);
      
      // Mostrar error específico al usuario
      let errorMessage = 'Error al procesar la traducción.';
      if (error.message.includes('Timeout')) {
        errorMessage = 'La traducción tardó demasiado. Inténtalo de nuevo con un video más corto.';
      } else if (error.message.includes('API')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message.includes('503') || error.message.includes('overloaded')) {
        errorMessage = 'El servicio está sobrecargado. Inténtalo de nuevo en unos minutos.';
      } else if (error.message.includes('resultado inválido')) {
        errorMessage = 'No se pudo procesar el análisis. Inténtalo de nuevo.';
      } else if (error.message.includes('análisis')) {
        errorMessage = 'Error en el análisis de comportamiento. Inténtalo de nuevo.';
      }
      
      setError(errorMessage);
    } finally {
      setCapturing(false);
    }
  };

  // Reintentar traducción
  const retryTranslation = () => {
    setError(null);
    sendToTranslator();
  };

  // Timer para grabación
  React.useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showPreview && capturedMedia) {
    return (
      <div className="h-screen bg-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-12">
          <button 
            onClick={() => setShowPreview(false)}
            className="text-white text-xl font-bold"
            disabled={capturing}
          >
            ←
          </button>
          <h1 className="text-white font-bold">Vista previa</h1>
          <button 
            onClick={sendToTranslator}
            disabled={capturing}
            className={`font-bold ${capturing ? 'text-gray-400' : 'text-orange-500'}`}
          >
            {capturing ? 'Procesando...' : 'Enviar'}
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          {capturedMedia.type === 'photo' ? (
            <img 
              src={capturedMedia.data} 
              alt="Captura" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : (
            <video 
              src={capturedMedia.data} 
              controls 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          )}
          
          {/* Loading overlay */}
          {capturing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p>Analizando con el traductor perro-humano...</p>
              </div>
            </div>
          )}
          
          {/* Error overlay */}
          {error && !capturing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center p-6">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="mb-4 text-sm">{error}</p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setError(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={retryTranslation}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <button 
          onClick={() => navigate('/')}
          className="text-white text-xl font-bold"
        >
          ✕
        </button>
        <button className="bg-gray-800 text-white px-4 py-2 rounded-full flex items-center space-x-2">
          <span className="text-lg">🎵</span>
          <span className="text-sm">Agregar sonido</span>
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <Webcam
          ref={webcamRef}
          audio={true}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMedia={onUserMedia}
          className="w-full h-full object-cover"
        />

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span>{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Right side controls */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-6">
          <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
          <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="p-6">
        {/* Capture mode selector */}
        <div className="flex justify-center space-x-4 mb-6">
          <button className="text-gray-400 text-sm">10 min</button>
          <button className="text-gray-400 text-sm">60 s</button>
          <button className="text-gray-400 text-sm">15 s</button>
          <button 
            onClick={() => setCaptureMode('photo')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              captureMode === 'photo' 
                ? 'bg-white text-black' 
                : 'text-white'
            }`}
          >
            FOTO
          </button>
          <button 
            onClick={() => setCaptureMode('video')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              captureMode === 'video' 
                ? 'bg-white text-black' 
                : 'text-white'
            }`}
          >
            TEXTO
          </button>
        </div>

        {/* Camera button and controls */}
        <div className="flex items-center justify-center space-x-8">
          {/* Main capture button */}
          <button
            onMouseDown={handleCaptureStart}
            onMouseUp={handleCaptureEnd}
            onTouchStart={handleCaptureStart}
            onTouchEnd={handleCaptureEnd}
            className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${
              isRecording ? 'bg-red-500 scale-110' : 'bg-white'
            }`}
          >
            {isRecording ? (
              <div className="w-8 h-8 bg-white rounded"></div>
            ) : (
              <div className="w-12 h-12 rounded-full" style={{ backgroundColor: '#db195d' }}></div>
            )}
          </button>

          {/* Gallery button */}
          <button 
            onClick={openFileSelector}
            className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Bottom navigation labels */}
        <div className="flex justify-between mt-6 px-4">
          <span className="text-white text-sm">PUBLICACIÓN</span>
          <span className="text-white text-sm">CREAR</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Camera;
