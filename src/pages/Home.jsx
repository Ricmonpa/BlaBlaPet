import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import SharedFeed from '../components/SharedFeed';
import videoShareService from '../services/videoShareService.js';
import { compressVideo, needsCompression } from '../utils/videoCompression.js';
import directBlobUploadService from '../services/directBlobUploadService.js';

const convertBlobToFile = async (blobData, mediaType) => {
  try {
    console.log('🎬 Convirtiendo blob a archivo con compresión y upload directo...');
    
    // Si es un blob URL, convertir a blob
    let blob;
    if (typeof blobData === 'string' && blobData.startsWith('blob:')) {
      const response = await fetch(blobData);
      blob = await response.blob();
    } else if (blobData instanceof Blob) {
      blob = blobData;
    } else {
      throw new Error('Formato de datos no soportado');
    }

    console.log('📁 Blob original:', {
      size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
      type: blob.type
    });

    // NUEVO: Comprimir video si es necesario
    let processedBlob = blob;
    if (mediaType === 'video' && needsCompression(blob)) {
      console.log('🎬 Video necesita compresión, procesando...');
      processedBlob = await compressVideo(blob);
      console.log('✅ Video comprimido exitosamente');
    }

    // Crear archivo con el blob procesado
    const fileName = `video_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
    const file = new File([processedBlob], fileName, { type: processedBlob.type });

    console.log('📁 Archivo procesado:', {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });

    // NUEVO: Upload directo al Blob Store (bypass de Vercel Functions)
    console.log('📤 Subiendo archivo directamente al Blob Store...');
    
    // Preparar metadata
    const metadata = {
      petName: location.state?.translation?.split(' ')[0] || 'Video Subido',
      translation: location.state?.translation || 'Análisis completado',
      emotionalDubbing: location.state?.output_emocional || '',
      subtitles: location.state?.subtitles || [],
      totalDuration: location.state?.totalDuration || 0,
      userId: 'uploaded_user',
      tags: ['mascota', 'video', 'ai']
    };

    // Usar el servicio de upload directo
    const uploadResult = await directBlobUploadService.uploadVideo(file, metadata);
    
    console.log('✅ Upload directo exitoso:', uploadResult.id);
    console.log('🔗 URL del video:', uploadResult.mediaUrl);

    if (mediaType === 'video') {
      // Crear thumbnail del video
      const thumbnail = await createVideoThumbnail(processedBlob);
      
      return {
        file,
        url: uploadResult.mediaUrl,
        fileName: uploadResult.id,
        size: file.size,
        originalSize: blob.size, // Tamaño original antes de compresión
        isVideo: true,
        thumbnail,
        filePath: uploadResult.id,
        metadata: uploadResult,
        videoId: uploadResult.id
      };
    } else {
      return {
        file,
        url: uploadResult.mediaUrl,
        fileName: uploadResult.id,
        size: file.size,
        isVideo: false,
        filePath: uploadResult.id,
        metadata: uploadResult
      };
    }

  } catch (error) {
    console.error('❌ Error en upload directo:', error);
    console.error('❌ Error stack:', error.stack);
    
    // FALLBACK: Usar imagen estática de Unsplash si falla el upload
    console.log('🔄 Usando fallback a imagen estática...');
    const fallbackUrl = 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop';
    
    return {
      file: null,
      url: fallbackUrl,
      fileName: 'fallback.jpg',
      size: 0,
      isVideo: false
    };
  }
};

// Función para crear thumbnail de video
const createVideoThumbnail = (videoBlob) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.onloadedmetadata = () => {
      // Tomar frame en el 25% del video
      video.currentTime = video.duration * 0.25;
    };
    
    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    };
    
    video.onerror = reject;
    video.src = URL.createObjectURL(videoBlob);
  });
};

const Home = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const location = useLocation();

  // Manejar nuevo video desde la cámara
  useEffect(() => {
    console.log('🚀 DEBUG - useEffect ejecutado en Home.jsx');
    console.log('🔍 DEBUG - location.state:', location.state);
    console.log('🔍 DEBUG - location.pathname:', location.pathname);
    console.log('🔍 DEBUG - window.location.href:', window.location.href);
    console.log('🔍 DEBUG - Condiciones useEffect:');
    console.log('  - location.state?.translation:', location.state?.translation);
    console.log('  - location.state?.output_emocional:', location.state?.output_emocional);
    console.log('  - location.state?.isSequentialSubtitles:', location.state?.isSequentialSubtitles);
    console.log('  - Condición completa:', location.state?.translation || location.state?.output_emocional || location.state?.isSequentialSubtitles);
    
    // Solo procesar si hay datos válidos (no null/undefined)
    if (location.state && (location.state.translation || location.state.output_emocional || location.state.isSequentialSubtitles)) {
      const handleVideoSave = async () => {
        try {
          console.log('🚀 DEBUG - Iniciando handleVideoSave');
          console.log('🔍 DEBUG - location.state.media:', location.state.media);
          
          // Convertir blob URL a archivo real
          console.log('🎬 Convirtiendo blob a archivo para upload directo...');
          const videoFile = await convertBlobToFile(
            location.state.media?.data, 
            location.state.media?.type || 'video'
          );
          console.log('✅ DEBUG - convertBlobToFile completado:', videoFile);

          // Solo guardar si la subida fue exitosa (no es fallback de Unsplash)
          console.log('🔍 DEBUG - Condiciones para guardar video:');
          console.log('  - videoFile.url:', videoFile.url);
          console.log('  - includes unsplash:', videoFile.url?.includes('unsplash.com'));
          console.log('  - videoFile.isVideo:', videoFile.isVideo);
          console.log('  - Condición completa:', videoFile.url && !videoFile.url.includes('unsplash.com') && videoFile.isVideo);
          
          if (videoFile.url && !videoFile.url.includes('unsplash.com') && videoFile.isVideo) {
            // Crear objeto de video para la base de datos
            const newVideo = {
              petName: 'Tu Mascota',
              translation: location.state.translation || location.state.output_tecnico || 'Análisis de comportamiento',
              emotionalDubbing: location.state.output_emocional || location.state.translation,
              // Guardar el VIDEO COMPLETO, no solo thumbnail
              mediaUrl: videoFile.url, // Video completo subido a Vercel Blob
              mediaType: location.state.media?.type || 'video',
              userId: 'current_user', // Por ahora usar un ID fijo
              tags: ['nuevo', 'análisis'],
              duration: location.state.totalDuration || 30,
              resolution: '400x600',
              format: 'mp4',
              // Incluir propiedades de subtítulos secuenciales
              isSequentialSubtitles: location.state.isSequentialSubtitles || false,
              subtitles: location.state.subtitles || null,
              totalDuration: location.state.totalDuration || 30,
              // Metadatos del archivo real
              fileSize: videoFile.size,
              fileName: videoFile.fileName,
              // Información adicional para videos
              isVideo: videoFile.isVideo,
              originalSize: videoFile.originalSize,
              thumbnail: videoFile.thumbnail,
              // Mantener blob URL original para reproducción inmediata
              originalVideoUrl: location.state.media?.data
            };

            // Guardar en la base de datos usando videoShareService
            console.log('💾 Guardando video en base de datos con URL:', videoFile.url);
            const videoUrl = await videoShareService.storeVideoAndGenerateUrl(newVideo);
            console.log('✅ Video guardado en la base de datos:', videoUrl);
            console.log('🔍 Video object guardado:', newVideo);
            // El feed se actualizará automáticamente
          } else {
            console.log('⚠️ No se guardó el video - subida falló o es fallback');
          }
        } catch (error) {
          console.error('❌ Error guardando video:', error);
          console.error('❌ Error stack:', error.stack);
        }
      };

      handleVideoSave();

      // Limpiar el state para evitar duplicados SOLO si se procesó el video
      window.history.replaceState({}, document.title);
    } else {
      console.log('⚠️ DEBUG - useEffect no ejecutó handleVideoSave - condiciones no cumplidas');
      console.log('🔍 DEBUG - State NO limpiado porque no se procesó video');
    }
    console.log('🏁 DEBUG - useEffect terminado en Home.jsx');
  }, [location.state]);

  // Manejar selección de video
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    console.log('Video seleccionado:', video);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para manejar la subida del video
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#DC195C' }}>
      {/* Formulario para capturar el nombre del perro (puedes dejarlo como campo opcional visual, pero no usarlo en la lógica) */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="dogName">Nombre del perro (opcional):</label>
        <input
          id="dogName"
          type="text"
          placeholder="Ejemplo: Rocky"
          className="mb-2 px-2 py-1 border rounded"
        />
        {/* ...otros campos y botones... */}
      </form>

      {/* Feed de la Comunidad */}
      <div className="flex-1">
        <SharedFeed onVideoSelect={handleVideoSelect} />
      </div>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Home;
