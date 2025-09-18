import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import SharedFeed from '../components/SharedFeed';
import videoShareService from '../services/videoShareService.js';

const convertBlobToFile = async (blobData, mediaType) => {
  try {
    console.log('🎬 Convirtiendo blob a archivo para upload directo...');
    
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

    // Crear un archivo con nombre único
    const fileName = `video_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
    const file = new File([blob], fileName, { type: blob.type });

    console.log('📁 Archivo creado:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // NUEVO: Upload directo con signed URL (evita límite de 10s de Vercel)
    console.log('🔗 Obteniendo signed URL para upload directo...');
    
    // Paso 1: Obtener signed URL
    const signedUrlResponse = await fetch('/api/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: fileName,
        contentType: file.type,
        fileSize: file.size
      })
    });

    if (!signedUrlResponse.ok) {
      const errorData = await signedUrlResponse.text();
      console.error('❌ Error obteniendo signed URL:', errorData);
      throw new Error(`Error obteniendo signed URL: ${signedUrlResponse.status} - ${errorData}`);
    }

    const { uploadUrl, filename: uniqueFilename } = await signedUrlResponse.json();
    console.log('✅ Signed URL obtenida:', uploadUrl);

    // Paso 2: Upload directo a Vercel Blob
    console.log('📤 Subiendo archivo directamente a Vercel Blob...');
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!uploadResponse.ok) {
      console.error('❌ Error en upload directo:', uploadResponse.status, uploadResponse.statusText);
      throw new Error(`Error en upload directo: ${uploadResponse.status}`);
    }

    console.log('✅ Archivo subido exitosamente a Blob');

    // Paso 3: Confirmar upload
    console.log('🔍 Confirmando upload...');
    
    const confirmResponse = await fetch('/api/confirm-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: uniqueFilename,
        contentType: file.type,
        fileSize: file.size,
        uploadedUrl: uploadUrl
      })
    });

    if (!confirmResponse.ok) {
      console.error('❌ Error confirmando upload:', confirmResponse.status);
      throw new Error(`Error confirmando upload: ${confirmResponse.status}`);
    }

    const confirmData = await confirmResponse.json();
    console.log('✅ Upload confirmado:', confirmData.url);

    // La URL final es la del Blob
    const serverUrl = uploadUrl;
    console.log('🔗 URL final del video:', serverUrl);

    if (mediaType === 'video') {
      // Crear thumbnail del video (mantener tu lógica existente)
      const thumbnail = await createVideoThumbnail(blob);
      
      return {
        file,
        url: serverUrl, // URL del Blob Storage
        fileName: uniqueFilename, // Nombre único generado
        size: file.size,
        originalSize: file.size,
        isVideo: true,
        thumbnail: thumbnail,
        filePath: uniqueFilename // Para compatibilidad con tu código existente
      };
    } else {
      return {
        file,
        url: serverUrl, // URL del Blob Storage
        fileName: uniqueFilename, // Nombre único generado
        size: file.size,
        isVideo: false,
        filePath: uniqueFilename // Para compatibilidad con tu código existente
      };
    }
  } catch (error) {
    console.error('❌ Error convirtiendo blob a archivo:', error);
    console.error('❌ Error stack:', error.stack);
    
    if (error.name === 'AbortError') {
      console.log('⏰ TIMEOUT: Upload cancelado después de 5 minutos');
    }
    
    console.log('🔄 Usando fallback a imagen estática...');
    // Fallback a imagen estática (mantener tu lógica existente)
    return {
      file: null,
      url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
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
            const videoUrl = await videoShareService.storeVideoAndGenerateUrl(newVideo);
            console.log('✅ Video guardado en la base de datos:', videoUrl);
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
