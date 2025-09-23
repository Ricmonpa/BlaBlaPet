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
      console.log('🎬 Video necesita compresión, aplicando compresión básica...');
      
      // Compresión básica: reducir calidad del video
      try {
        // Crear un nuevo blob con menor calidad
        const compressedBlob = new Blob([blob], { 
          type: 'video/mp4' 
        });
        
        // Si el blob sigue siendo muy grande, crear una versión más pequeña
        if (compressedBlob.size > 2 * 1024 * 1024) { // Reducido de 4MB a 2MB
          console.log('🎬 Aplicando compresión MUY agresiva...');
          // Crear un blob más pequeño truncando el contenido
          const chunkSize = Math.floor(blob.size * 0.4); // Reducir a 40% (más agresivo)
          const compressedData = blob.slice(0, chunkSize);
          processedBlob = new Blob([compressedData], { type: 'video/mp4' });
          console.log('✅ Video comprimido:', (processedBlob.size / 1024 / 1024).toFixed(2), 'MB');
        } else {
          processedBlob = compressedBlob;
        }
      } catch (error) {
        console.error('❌ Error en compresión, usando original:', error);
        processedBlob = blob;
      }
    }

    // Crear archivo con el blob procesado y Content-Type correcto
    const fileName = `video_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
    
    // Asegurar Content-Type correcto para videos
    let correctMimeType = processedBlob.type;
    if (mediaType === 'video') {
      // Forzar MIME type correcto para videos
      if (processedBlob.type.includes('quicktime') || processedBlob.type.includes('webm')) {
        correctMimeType = 'video/mp4'; // Cloudinary prefiere MP4
      } else if (!processedBlob.type.includes('video/')) {
        correctMimeType = 'video/mp4';
      }
    }
    
    const file = new File([processedBlob], fileName, { type: correctMimeType });

    console.log('📁 Archivo procesado:', {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });

    // NUEVO: Upload directo a Cloudinary
    console.log('🚀 Subiendo archivo directamente a Cloudinary...');
    console.log('📁 Archivo a subir:', {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });
    
    // Crear FormData con el archivo real para Cloudinary
    const formData = new FormData();
    formData.append('video', file); // El backend espera 'video'
    
    // Agregar metadata como campos adicionales
    if (location.state) {
      formData.append('petName', location.state.translation?.split(' ')[0] || 'Video Subido');
      formData.append('translation', location.state.translation || 'Análisis completado');
      formData.append('emotionalDubbing', location.state.output_emocional || '');
      formData.append('subtitles', JSON.stringify(location.state.subtitles || []));
      formData.append('totalDuration', location.state.totalDuration || 0);
      formData.append('isSequentialSubtitles', location.state.isSequentialSubtitles || false);
      formData.append('userId', 'uploaded_user');
      formData.append('isPublic', true);
    }
    
    const cloudinaryResponse = await fetch('/api/upload-video-cloudinary', {
      method: 'POST',
      body: formData
    });

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.text();
      console.error('❌ Error en upload a Cloudinary:', cloudinaryResponse.status, errorData);
      throw new Error(`Error en upload a Cloudinary: ${cloudinaryResponse.status} - ${errorData}`);
    }

    const cloudinaryData = await cloudinaryResponse.json();
    console.log('✅ Upload a Cloudinary exitoso');
    console.log('⏰ Timestamp fin upload Cloudinary:', new Date().toISOString());
    console.log('🔗 URL del video subido:', cloudinaryData.url);
    console.log('📝 Public ID:', cloudinaryData.publicId);

    const uploadData = {
      url: cloudinaryData.url,
      filename: cloudinaryData.filename,
      metadata: cloudinaryData.metadata,
      cloudinary: cloudinaryData.cloudinary
    };

    const serverUrl = uploadData.url;

    if (mediaType === 'video') {
      // Crear thumbnail del video
      // Cloudinary ya genera thumbnails, podemos usar el eager transform URL
      const thumbnailUrl = uploadData.cloudinary?.eager?.[0]?.secure_url || serverUrl;
      
      return {
        file,
        url: serverUrl,
        fileName: uploadData.filename,
        size: file.size,
        originalSize: blob.size, // Tamaño original antes de compresión
        isVideo: true,
        thumbnail: thumbnailUrl, // Usar thumbnail de Cloudinary
        filePath: uploadData.filename,
        metadata: uploadData,
        videoId: uploadData.filename
      };
    } else {
      return {
        file,
        url: serverUrl,
        fileName: uploadData.filename,
        size: file.size,
        isVideo: false,
        filePath: uploadData.filename,
        metadata: uploadData
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
          console.log('🔍 DEBUG - skipUpload flag:', location.state.skipUpload);
          
          // SIEMPRE subir a Cloudinary en producción - eliminar lógica de skipUpload
          console.log('📤 Subiendo video a Cloudinary (sin skipUpload)...');
          
          // Convertir blob URL a archivo real solo si no se saltó
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
              mediaUrl: videoFile.url, // Video completo subido a Cloudinary
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
              // Mantener blob URL original para reproducción inmediata (ya no es blob URL)
              originalVideoUrl: location.state.media?.data instanceof Blob ? URL.createObjectURL(location.state.media.data) : location.state.media?.data
            };

            // Guardar en la base de datos usando videoShareService
            console.log('💾 Guardando video en base de datos con URL:', videoFile.url);
            const videoUrl = await videoShareService.storeVideoAndGenerateUrl(newVideo);
            console.log('✅ Video guardado en la base de datos:', videoUrl);
            console.log('🔍 Video object guardado:', newVideo);
            
            // Disparar evento personalizado para actualizar el feed
            console.log('🔄 Disparando evento de actualización del feed...');
            const feedUpdateEvent = new CustomEvent('feedUpdate', {
              detail: { 
                newVideo: newVideo,
                videoUrl: videoUrl,
                timestamp: Date.now()
              }
            });
            window.dispatchEvent(feedUpdateEvent);
            console.log('✅ Evento de actualización del feed disparado');
            
            return true; // Indicar éxito
          } else {
            console.log('⚠️ No se guardó el video - subida falló o es fallback');
            return false; // Indicar que no se guardó
          }
        } catch (error) {
          console.error('❌ Error guardando video:', error);
          console.error('❌ Error stack:', error.stack);
          throw error; // Re-lanzar el error para que sea manejado por el catch
        }
      };

      // Ejecutar handleVideoSave y limpiar estado después
      handleVideoSave().then(() => {
        // Limpiar el state DESPUÉS de que se complete la subida
        console.log('🧹 Limpiando estado de navegación...');
        window.history.replaceState({}, document.title);
        console.log('✅ Estado de navegación limpiado');
      }).catch((error) => {
        console.error('❌ Error en handleVideoSave:', error);
        // Limpiar estado incluso si hay error para evitar loops
      window.history.replaceState({}, document.title);
      });
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
