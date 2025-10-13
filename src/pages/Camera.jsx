import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import translatorService from '../services/translatorService';
import directBlobUploadService from '../services/directBlobUploadService';
import BottomNavigation from '../components/BottomNavigation';
import { rateLimiter } from '../utils/rateLimiter';

const Camera = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [captureMode, setCaptureMode] = useState('video'); // 'photo', 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user"); // "user" para frontal, "environment" para trasera
  const [stream, setStream] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const videoRef = useRef(null);
  const [rateLimitStats, setRateLimitStats] = useState({ used: 0, remaining: 25, limit: 25 });

  // Actualizar estadísticas del rate limit
  const updateRateLimitStats = useCallback(() => {
    const stats = rateLimiter.getStats();
    setRateLimitStats(stats);
  }, []);

  // Función para obtener el stream de la cámara
  const getCameraStream = useCallback(async (facingMode) => {
    try {
      setIsLoadingCamera(true);
      
      // Detener todos los streams existentes primero
      const tracks = videoRef.current?.srcObject?.getTracks() || [];
      tracks.forEach(track => track.stop());

      // DETECTAR MOBILE para ajustar resolución
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      const constraints = {
        video: {
          // Mobile: 480p para reducir tamaño y memoria
          // Desktop: 720p para mejor calidad
          width: isMobile ? 480 : 720,
          height: isMobile ? 854 : 1280,
          facingMode: facingMode
        },
        audio: true
      };

      console.log(`📱 Obteniendo stream para ${isMobile ? 'MOBILE' : 'DESKTOP'}: ${constraints.video.width}x${constraints.video.height}`);

      console.log(`Obteniendo stream para cámara: ${facingMode}`);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Asignar stream al video element ANTES de actualizar el estado
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(console.error);
      }
      
      setStream(newStream);
      setIsLoadingCamera(false);
      
      console.log(`✅ Cámara ${facingMode} inicializada correctamente`);
      return newStream;
    } catch (error) {
      console.error(`❌ Error accediendo a la cámara ${facingMode}:`, error);
      setIsLoadingCamera(false);
      return null;
    }
  }, []);

  // Función para cambiar entre cámara frontal y trasera
  const switchCamera = useCallback(() => {
    console.log("Cambiando cámara...");
    setFacingMode(prevMode => {
      const newMode = prevMode === "user" ? "environment" : "user";
      console.log(`Cambiando de ${prevMode} a ${newMode}`);
      
      // Cambiar cámara inmediatamente
      getCameraStream(newMode);
      return newMode;
    });
  }, []);

  // Inicializar cámara al montar el componente
  useEffect(() => {
    console.log('Inicializando cámara...');
    getCameraStream("user"); // Inicializar siempre con cámara frontal
    
    // Cleanup al desmontar
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Cargar estadísticas del rate limit al montar
  useEffect(() => {
    updateRateLimitStats();
  }, [updateRateLimitStats]); // Solo ejecutar una vez al montar

  // Configuración de video (mantener para compatibilidad)
  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: facingMode
  };

  // Manejar captura de foto
  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageSrc = canvas.toDataURL('image/jpeg');
      setCapturedMedia({ type: 'photo', data: imageSrc });
      setShowPreview(true);
    }
  }, []);

  // Manejar inicio de grabación
  const startRecording = useCallback(() => {
    console.log('Iniciando grabación...');
    if (stream && mediaRecorderRef.current) {
      setRecordedChunks([]);
      mediaRecorderRef.current.start(100); // Grabar en chunks de 100ms
      setIsRecording(true);
      setRecordingTime(0);
      console.log('Grabación iniciada');
    } else {
      console.error('No hay stream o MediaRecorder disponible');
    }
  }, [stream]);

  // Manejar fin de grabación
  const stopRecording = useCallback(() => {
    console.log('Deteniendo grabación...');
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        console.log('Grabación detenida - MediaRecorder.stop() ejecutado');
        
        // Timeout de seguridad para procesar video si onstop no se ejecuta
        setTimeout(() => {
          if (recordedChunks.length > 0) {
            console.log('Procesando video por timeout de seguridad...');
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(blob);
            console.log('Video de seguridad creado:', blob.size, 'bytes');
            console.log('URL de seguridad:', videoUrl);
            
            setCapturedMedia({ 
              type: 'video', 
              data: videoUrl,
              blob: blob
            });
            setShowPreview(true);
            console.log('Vista previa activada por timeout');
          }
        }, 1000);
        
      } catch (error) {
        console.error('Error deteniendo grabación:', error);
        setIsRecording(false);
      }
    } else {
      console.log('No hay grabación activa para detener');
    }
  }, [isRecording, recordedChunks]);

  // Configurar MediaRecorder cuando cambie el stream
  useEffect(() => {
    if (stream) {
      // Limpiar chunks anteriores
      setRecordedChunks([]);
      
      // Crear MediaRecorder con bitrate limitado para evitar archivos enormes
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const targetBitrate = isMobile ? 1000000 : 2000000; // 1Mbps mobile, 2Mbps desktop
      
      console.log(`🎬 MediaRecorder configurado: ${isMobile ? 'MOBILE' : 'DESKTOP'}, bitrate: ${targetBitrate/1000}kbps`);
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: targetBitrate  // ✅ LIMITAR bitrate
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Datos de video recibidos:', event.data.size);
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log('Grabación detenida, procesando video...');
        console.log('Chunks disponibles:', recordedChunks.length);
        
        if (recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          console.log('Video creado:', blob.size, 'bytes');
          
          const videoUrl = URL.createObjectURL(blob);
          console.log('URL del video creada:', videoUrl);
          
          setCapturedMedia({ 
            type: 'video', 
            data: videoUrl,
            blob: blob
          });
          setShowPreview(true);
          console.log('Vista previa activada');
        } else {
          console.error('No hay chunks de video para procesar');
        }
      };
    }
  }, [stream]);

  // Manejar eventos del botón de captura - Modo TikTok
  const handleCaptureStart = () => {
    console.log('Botón presionado - Modo:', captureMode);
    if (captureMode === 'photo') {
      capturePhoto();
    } else {
      // Para video: iniciar grabación al presionar
      console.log('Iniciando grabación de video...');
      startRecording();
    }
  };

  const handleCaptureEnd = () => {
    console.log('Botón soltado - Grabando:', isRecording);
    if (captureMode === 'video' && isRecording) {
      // Para video: detener grabación al soltar
      console.log('Deteniendo grabación de video...');
      stopRecording();
    }
  };

  // Manejar selección de archivo desde galería
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 🔑 CLAVE: Detener cámara INMEDIATAMENTE para evitar confusión visual
    // Esto previene que el usuario vea la vista "Grabar" mientras se procesa el archivo
    const tracks = videoRef.current?.srcObject?.getTracks() || [];
    tracks.forEach(track => track.stop());
    console.log('📷 Cámara detenida - archivo seleccionado de galería');

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
      // Para videos, verificar tamaño y comprimir si es necesario
      const videoSizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.log(`🎬 Video de galería seleccionado: ${videoSizeMB} MB`);
      
      // 🔑 CLAVE: Crear y mostrar preview INMEDIATAMENTE con video original
      const tempVideoUrl = URL.createObjectURL(file);
      setCapturedMedia({ 
        type: 'video', 
        data: tempVideoUrl,
        blob: file,
        originalFile: file
      });
      setShowPreview(true);  // ← MOSTRAR PREVIEW AL INSTANTE
      console.log('📹 Preview mostrado inmediatamente con video original');
      
      if (file.size > 15 * 1024 * 1024) { // > 15MB
        console.log('📦 Video muy grande, comprimiendo automáticamente...');
        console.log('📦 Tamaño original:', videoSizeMB + ' MB');
        
        try {
          // Mostrar overlay de compresión SOBRE el preview
          setCapturing(true);
          console.log('🐶 Alistando video para traducción perruna...');
          
          // Importar SmartVideoCompressor dinámicamente
          const { default: SmartVideoCompressor } = await import('../utils/smartVideoCompressor.js');
          
          // Comprimir video de galería
          const compressionResult = await SmartVideoCompressor.compressWithFallback(file);
          const compressedFile = compressionResult.file;
          
          const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
          console.log('✅ Video comprimido:', {
            original: videoSizeMB + ' MB',
            compressed: compressedSizeMB + ' MB',
            reduction: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
          });
          
          // Actualizar preview con video comprimido
          const compressedVideoUrl = URL.createObjectURL(compressedFile);
          URL.revokeObjectURL(tempVideoUrl); // Liberar URL temporal
          
          setCapturedMedia({ 
            type: 'video', 
            data: compressedVideoUrl,
            blob: compressedFile, // Guardar blob comprimido
            originalFile: file    // Guardar archivo original para referencia
          });
          
          setCapturing(false);
          console.log('✅ Video comprimido listo para análisis');
          
        } catch (compressionError) {
          console.error('❌ Error comprimiendo video:', compressionError);
          setCapturing(false);
          // Preview ya tiene video original, no hacer nada más
          console.log('⚠️ Manteniendo video original en preview');
        }
      } else {
        // Video pequeño, ya está en preview
        console.log('✅ Video pequeño, listo en preview');
      }
    }
  };

  // Abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Convertir blob URL a File
  const convertBlobToFile = async (blobUrl, fileName) => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error('Error convirtiendo blob a file:', error);
      return null;
    }
  };

  // Enviar al traductor
  const sendToTranslator = async () => {
    if (!capturedMedia) return;
    
    try {
      // ✅ RATE LIMIT CHECK - Verificar si puede procesar video
      const { allowed, remaining } = rateLimiter.canUpload();
      
      if (!allowed) {
        setError({
          message: '⏸️ Límite diario alcanzado',
          details: `Has usado tus ${rateLimitStats.limit} videos de hoy. Vuelve mañana para más traducciones. 🐕`,
          type: 'rate_limit'
        });
        return;
      }
      
      console.log(`📊 Rate limit check: ${remaining} videos restantes hoy`);
      
      // Limpiar errores previos
      setError(null);
      
      // Mostrar indicador de carga
      setCapturing(true);
      
      // Timeout diferenciado: Mobile 5 min, Desktop 20 min
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const timeoutDuration = isMobile ? 300000 : 1200000; // 5 min vs 20 min

      console.log(`⏱️ Timeout configurado: ${timeoutDuration/60000} minutos (${isMobile ? 'Mobile' : 'Desktop'})`);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La traducción tardó demasiado')), timeoutDuration)
      );
      
      let result;
      let videoFile = null;
      
      // Si es un video, usar ANÁLISIS RÁPIDO + upload en background
      if (capturedMedia.type === 'video') {
        console.log('🎬 Procesando video con análisis rápido...');
        console.log('🔍 DEBUG - capturedMedia:', {
          type: capturedMedia.type,
          dataType: typeof capturedMedia.data,
          hasBlob: !!capturedMedia.blob,
          blobSize: capturedMedia.blob?.size
        });
        
        // Convertir blob URL a File para upload posterior
        const fileName = `video_${Date.now()}.webm`;
        console.log('🔍 DEBUG - Iniciando convertBlobToFile en Camera...');
        videoFile = await convertBlobToFile(capturedMedia.data, fileName);
        console.log('✅ DEBUG - convertBlobToFile en Camera completado:', {
          fileName: videoFile.name,
          size: videoFile.size
        });
        
        // PASO 1: ANALIZAR VIDEO ORIGINAL (compresión se maneja en sequentialSubtitlesService)
        console.log('🎬 Analizando video para Gemini...');
        console.log('🔍 DEBUG - Iniciando análisis con Gemini...');
        console.log('🔍 DEBUG - Video size para análisis:', capturedMedia.blob?.size || 'unknown');
        console.log('🔍 DEBUG - Enviando video original a sequentialSubtitlesService (compresión ahí)');
        
        // Usar video original - la compresión se maneja en sequentialSubtitlesService.js
        result = await translatorService.generateSequentialSubtitles(
          capturedMedia.data, // Video original
          capturedMedia.type
        );
        
        console.log('✅ DEBUG - Análisis con Gemini completado:', {
          success: result?.success,
          subtitlesCount: result?.subtitles?.length,
          totalDuration: result?.totalDuration
        });
        
        // LIMPIEZA DE MEMORIA: Liberar recursos ANTES de navegar (excepto blob URL)
        console.log('🧹 LIMPIEZA: Liberando recursos de memoria...');
        
        // NO liberar blob URL aquí - Home.jsx la necesita para upload
        console.log('🧹 Blob URL preservada para Home.jsx');
        
        // Limpiar chunks de grabación
        setRecordedChunks([]);
        console.log('🧹 Recorded chunks liberados');
        
        // Forzar garbage collection si está disponible
        if (window.gc) {
          window.gc();
          console.log('🧹 Garbage collection forzado');
        }
        
        // PASO 2: UPLOAD SÍNCRONO CON PROGRESO VISUAL (comprimido para almacenamiento)
        if (videoFile) {
          console.log('📤 Iniciando upload síncrono con progreso...');
          console.log('🔍 DEBUG - Video file details:', {
            name: videoFile.name,
            size: `${(videoFile.size / 1024 / 1024).toFixed(2)} MB`,
            type: videoFile.type,
            lastModified: new Date(videoFile.lastModified).toISOString()
          });
          
          // Mostrar progreso de upload al usuario
          setCapturing(false); // Terminar análisis
          setUploading(true);  // Iniciar upload
          
          try {
            console.log('🔍 DEBUG - Llamando a directBlobUploadService.uploadVideo...');
            
            // Upload síncrono - el usuario ve el progreso
            const uploadResult = await directBlobUploadService.uploadVideo(videoFile, {
            petName: localStorage.getItem('userName') || 'Anónimo',
            userId: localStorage.getItem('userName') || 'current_user',
            tags: ['video', 'analisis'],
            forAnalysis: false // Usar compresión agresiva para almacenamiento
          });
            
            console.log('✅ Video comprimido subido exitosamente:', uploadResult.mediaUrl);
            console.log('🔍 DEBUG - Upload result completo:', {
              mediaUrl: uploadResult.mediaUrl,
              id: uploadResult.id,
              success: uploadResult.success,
              cloudinary: uploadResult.cloudinary
            });
            
            capturedMedia.uploadedUrl = uploadResult.mediaUrl;
            capturedMedia.videoId = uploadResult.id;
            
            console.log('🔍 DEBUG - capturedMedia actualizado:', {
              uploadedUrl: capturedMedia.uploadedUrl,
              videoId: capturedMedia.videoId
            });
            
            setUploading(false);
            console.log('✅ Upload completado, procediendo con navegación...');
            
          } catch (uploadError) {
            console.error('❌ Error en upload síncrono:', uploadError.message);
            console.error('❌ Error stack:', uploadError.stack);
            console.error('❌ Error details:', {
              name: uploadError.name,
              message: uploadError.message,
              cause: uploadError.cause
            });
            
            setUploading(false);
            
            // Mostrar error al usuario
            setError(`Error subiendo video: ${uploadError.message}. Inténtalo de nuevo.`);
            return; // No navegar si falla el upload
          }
        } else {
          console.warn('⚠️ No hay videoFile para subir - esto no debería pasar');
        }
        
        // Navegar directamente al home con los subtítulos secuenciales
        if (result && result.success) {
          // Preservar el video local para mostrar inmediatamente
          const preservedMedia = {
            ...capturedMedia,
            // Mantener el blob local para mostrar inmediatamente
            localData: capturedMedia.data,
            // Info del upload en background
            uploadedUrl: capturedMedia.uploadedUrl,
            videoId: capturedMedia.videoId,
            // Usar URL remota si está disponible, sino local
            data: capturedMedia.uploadedUrl || capturedMedia.data
          };

          console.log('🧹 LIMPIEZA FINAL: Preparando navegación con datos mínimos...');
          
          // Crear objeto de navegación con datos mínimos para reducir memoria
          const navigationState = {
              // Campos para subtítulos secuenciales
              subtitles: result.subtitles,
              totalDuration: result.totalDuration,
              isSequentialSubtitles: true,
              // Campos existentes para compatibilidad
              translation: result.subtitles[0]?.traduccion_tecnica || 'Análisis de video',
              output_tecnico: result.subtitles[0]?.traduccion_tecnica,
              output_emocional: result.subtitles[0]?.traduccion_emocional,
            // Media con blob comprimido para Home.jsx
            media: {
              type: capturedMedia.type,
              data: capturedMedia.data, // Blob URL del video comprimido
              blob: capturedMedia.blob  // Blob comprimido para upload
            },
              confidence: result.subtitles[0]?.confidence || 85,
              emotion: 'secuencial',
              behavior: 'análisis por momentos',
              context: 'video con subtítulos secuenciales',
              source: result.source,
              analysisType: 'sequential',
              // Información del video subido
              videoFile: videoFile,
              uploadedUrl: capturedMedia.uploadedUrl,
              videoId: capturedMedia.videoId,
              // Flag para indicar que no necesita upload adicional
              skipUpload: true
          };
          
          console.log('🧹 Navegando con estado limpio...');
          console.log('🔍 DEBUG - navigationState final:', {
            skipUpload: navigationState.skipUpload,
            uploadedUrl: navigationState.uploadedUrl,
            videoId: navigationState.videoId,
            subtitlesCount: navigationState.subtitles?.length,
            hasMedia: !!navigationState.media,
            mediaType: navigationState.media?.type
          });
          
          // ✅ Registrar uso exitoso del video
          rateLimiter.recordUpload();
          updateRateLimitStats();
          console.log(`✅ Video procesado exitosamente. Quedan ${remaining - 1} videos hoy`);
          
          navigate('/', { state: navigationState });
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
        // ✅ Registrar uso exitoso del video
        rateLimiter.recordUpload();
        updateRateLimitStats();
        console.log(`✅ Video procesado exitosamente. Quedan ${remaining - 1} videos hoy`);
        
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
            analysisType: result.analysisType,
            // Para fotos no hay upload de video
            videoFile: null,
            uploadedUrl: null,
            videoId: null
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
      } else if (error.message.includes('subtítulos')) {
        errorMessage = 'Error generando subtítulos. El video se subió correctamente, inténtalo de nuevo.';
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
          <div className="text-center">
            <h1 className="text-white font-bold">Vista previa</h1>
            {/* Contador de rate limit */}
            <div className={`text-xs mt-1 ${
              rateLimitStats.remaining <= 5 ? 'text-yellow-400' : 
              rateLimitStats.remaining <= 2 ? 'text-red-400' : 
              'text-white/70'
            }`}>
              📊 {rateLimitStats.remaining}/{rateLimitStats.limit} videos restantes hoy
            </div>
          </div>
          <button 
            onClick={sendToTranslator}
            disabled={capturing || rateLimitStats.remaining <= 0}
            className={`font-bold ${
              capturing || rateLimitStats.remaining <= 0 ? 'text-gray-400' : 'text-orange-500'
            }`}
          >
            {rateLimitStats.remaining <= 0 ? 'Límite alcanzado' : (capturing ? 'Procesando...' : 'Enviar')}
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
            <div className="w-full h-full flex flex-col items-center justify-center">
              <video 
                src={capturedMedia.data} 
                controls 
                autoPlay
                muted
                className="max-w-full max-h-full object-contain rounded-lg"
                onLoadStart={() => console.log('Video cargando...')}
                onLoadedData={() => console.log('Video cargado correctamente')}
                onError={(e) => console.error('Error cargando video:', e)}
              />
              <div className="mt-4 text-white text-sm">
                <p>Tipo: {capturedMedia.type}</p>
                <p>URL: {capturedMedia.data ? 'Válida' : 'Inválida'}</p>
                <p>Blob: {capturedMedia.blob ? `${capturedMedia.blob.size} bytes` : 'No disponible'}</p>
              </div>
            </div>
          )}
          
          {/* Loading overlay - Análisis */}
          {capturing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center px-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="mb-2 text-lg font-semibold">
                  {capturedMedia?.originalFile 
                    ? 'Alistando tu video para la traducción perruna...'
                    : capturedMedia.type === 'video' 
                      ? 'Decodificando el mensaje de tu mejor amigo...' 
                      : 'Decodificando el mensaje de tu mejor amigo...'
                  }
                </p>
                {capturedMedia.type === 'video' && (
                  <div className="text-sm text-gray-300">
                    {capturedMedia?.originalFile ? (
                      <p className="text-xs">Optimizando el formato para el motor de traducción.</p>
                    ) : (
                      <>
                        <p>🧠 Mapeando tonos y vocalizaciones caninas.</p>
                        <p className="mt-1">🎙️ ¡Preparando el doblaje a voz humana!</p>
                        <p className="text-xs mt-2 text-gray-400">
                          Videos largos (&gt;1 min) toman 2-3 minutos. ¡Vale la pena la espera!
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading overlay - Upload */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center px-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="mb-2 text-lg font-semibold text-green-400">
                  ¡Publicación casi lista! 🚀
                </p>
                <div className="text-sm text-gray-300">
                  <p>☁️ Asegurando tu video en la Nube BlaBlaPet.</p>
                  <p className="text-xs mt-1">
                    Tu video está listo para el feed mundial de mascotas.
                  </p>
                  <div className="mt-3 flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Error overlay */}
          {error && !capturing && !uploading && (
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
    <div className="h-screen bg-black flex flex-col pb-16 no-pull-refresh">
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
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Camera indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {facingMode === "user" ? "📱 Frontal" : "📷 Trasera"}
        </div>

        {/* Loading indicator */}
        {isLoadingCamera && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm">Cargando cámara...</p>
            </div>
          </div>
        )}

        {/* Recording indicator - Mejorado para TikTok */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">{formatTime(recordingTime)}</span>
            <span className="text-xs opacity-75">GRABANDO</span>
          </div>
        )}

        {/* Right side controls - Botón de voltear cámara con texto */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 -translate-y-8 flex flex-col items-center space-y-2">
          <button 
            onClick={switchCamera}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path d="M1 4v6h6" />
              <path d="M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </button>
          <span className="text-white text-xs font-medium">Girar</span>
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
          {/* Main capture button - Modo TikTok */}
          <div className="relative">
            <button
              onMouseDown={handleCaptureStart}
              onMouseUp={handleCaptureEnd}
              onTouchStart={handleCaptureStart}
              onTouchEnd={handleCaptureEnd}
              className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 scale-110 border-red-300' 
                  : 'bg-white hover:scale-105'
              }`}
            >
              {isRecording ? (
                <div className="w-8 h-8 bg-white rounded-sm"></div>
              ) : (
                <div className="w-12 h-12 rounded-full" style={{ backgroundColor: '#db195d' }}></div>
              )}
            </button>
            
            {/* Anillo de grabación */}
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"></div>
            )}
          </div>

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

      {/* Bottom Navigation - Fixed */}
      <BottomNavigation />
    </div>
  );
};

export default Camera;
