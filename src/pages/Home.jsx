import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import SharedFeed from '../components/SharedFeed';
import videoShareService from '../services/videoShareService.js';
import SmartVideoCompressor from '../utils/smartVideoCompressor.js';
import directBlobUploadService from '../services/directBlobUploadService.js';

const convertBlobToFile = async (blobData, mediaType, originalBlob = null) => {
  try {
    console.log('🎬 Convirtiendo blob a archivo para upload directo...');
    
    // PRIORIDAD 1: Usar blob original si está disponible (evita expiración)
    let blob;
    if (originalBlob instanceof Blob) {
      console.log('✅ Usando blob original (sin expiración)...');
      blob = originalBlob;
    } else if (typeof blobData === 'string' && blobData.startsWith('blob:')) {
      console.log('🔄 Convirtiendo blob URL a blob...');
      const response = await fetch(blobData);
      if (!response.ok) {
        throw new Error(`Error fetching blob: ${response.status} ${response.statusText}`);
      }
      blob = await response.blob();
      console.log('✅ Blob URL convertido exitosamente');
    } else if (blobData instanceof Blob) {
      blob = blobData;
    } else {
      throw new Error('Formato de datos no soportado');
    }

    console.log('📁 Blob original:', {
      size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
      type: blob.type
    });

    // Validar que el blob sea válido
    if (blob.size === 0) {
      throw new Error('Blob vacío o corrupto');
    }

    // Asegurar que el tipo MIME sea correcto para Cloudinary
    let mimeType = blob.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      if (mediaType === 'video') {
        mimeType = 'video/mp4'; // Default a MP4 para videos
      } else {
        mimeType = 'image/jpeg'; // Default a JPEG para imágenes
      }
      console.log('🔧 Tipo MIME corregido a:', mimeType);
    }

    // Crear archivo con el blob y tipo MIME correcto
    const timestamp = Date.now();
    const extension = mediaType === 'video' ? 'mp4' : 'jpg';
    const fileName = `video_${timestamp}.${extension}`;
    
    const file = new File([blob], fileName, { 
      type: mimeType,
      lastModified: timestamp
    });

    console.log('📁 Archivo procesado:', {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type
    });

    // Validar que el archivo sea válido para upload
    if (file.size === 0) {
      throw new Error('Archivo vacío después de procesamiento');
    }

    // Aplicar compresión inteligente automática para videos
    if (mediaType === 'video') {
      console.log('🎯 Aplicando compresión inteligente automática...');
      
      try {
        const compressionResult = await SmartVideoCompressor.compressWithFallback(file);
        const compressedFile = compressionResult.file;
        
        console.log('✅ Compresión inteligente completada:', {
          perfilFinal: compressionResult.finalProfile,
          original: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          compressed: (compressedFile.size / 1024 / 1024).toFixed(2) + ' MB',
          intentos: compressionResult.attempts.length
        });
        
        return {
          file: compressedFile,
          url: URL.createObjectURL(compressedFile),
          fileName: compressedFile.name,
          size: compressedFile.size,
          isVideo: true,
          compressionInfo: compressionResult
        };
      } catch (compressionError) {
        console.warn('⚠️ Error en compresión inteligente, usando archivo original:', compressionError.message);
      }
    }

    return {
      file,
      url: URL.createObjectURL(file),
      fileName: file.name,
      size: file.size,
      isVideo: mediaType === 'video'
    };

  } catch (error) {
    console.error('❌ Error en convertBlobToFile:', error);
    
    // Fallback: NO retornar archivo null, mejor lanzar error
    console.log('🔄 Blob URL expirada o corrupta, no se puede procesar');
    
    throw new Error(`No se puede procesar el video: ${error.message}. Por favor, graba un nuevo video.`);
  }
};;

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
    
    // Limpiar videos con URLs blob expiradas al cargar la página
    const cleanupExpiredVideos = async () => {
      try {
        const deletedCount = await videoShareService.cleanupExpiredBlobVideos();
        if (deletedCount > 0) {
          console.log(`🧹 Limpieza completada: ${deletedCount} videos con URLs blob expiradas eliminados`);
        }
      } catch (error) {
        console.error('❌ Error en limpieza de videos:', error);
      }
    };
    
    cleanupExpiredVideos();
    
    // Solo procesar si hay datos válidos (no null/undefined)
    if (location.state && (location.state.translation || location.state.output_emocional || location.state.isSequentialSubtitles)) {
      const handleVideoSave = async () => {
        try {
          console.log('🚀 DEBUG - Iniciando handleVideoSave');
          console.log('🔍 DEBUG - location.state.media:', location.state.media);
          console.log('🔍 DEBUG - skipUpload flag:', location.state.skipUpload);
          
          // SIEMPRE subir a Cloudinary en producción - eliminar lógica de skipUpload
          console.log('📤 Subiendo video a Cloudinary (sin skipUpload)...');
          
          // Convertir blob URL a archivo real para upload a Cloudinary
          console.log('🎬 Convirtiendo blob a archivo para upload directo...');
          const videoFile = await convertBlobToFile(
            location.state.media?.data, 
            location.state.media?.type || 'video',
            location.state.media?.blob  // Pasar el blob original si está disponible
          );
          console.log('✅ DEBUG - convertBlobToFile completado:', videoFile);
          
          // Validar que el archivo sea válido antes de subir
          if (!videoFile.file) {
            throw new Error('No se puede procesar el video. El archivo está expirado o corrupto. Por favor, graba un nuevo video.');
          }
          
          // Subir el archivo a Cloudinary y obtener URL permanente
          console.log('☁️ Subiendo archivo a Cloudinary...');
          const uploadResult = await directBlobUploadService.uploadVideo(videoFile.file, {
            petName: 'Tu Mascota',
            userId: 'current_user',
            tags: ['nuevo', 'análisis'],
            isPublic: true
          });
          console.log('✅ Upload a Cloudinary completado:', uploadResult);

          // Solo guardar si la subida a Cloudinary fue exitosa
          console.log('🔍 DEBUG - Condiciones para guardar video:');
          console.log('  - uploadResult:', uploadResult);
          console.log('  - uploadResult.cloudinary:', uploadResult.cloudinary);
          console.log('  - hasCloudinaryData:', uploadResult.cloudinary && uploadResult.cloudinary.public_id);
          console.log('  - videoFile.isVideo:', videoFile.isVideo);
          console.log('  - Condición completa:', uploadResult.cloudinary && uploadResult.cloudinary.public_id && videoFile.isVideo);
          
          if (uploadResult.cloudinary && uploadResult.cloudinary.public_id && videoFile.isVideo) {
            // Crear objeto de video para la base de datos
            const newVideo = {
              petName: 'Tu Mascota',
              translation: location.state.translation || location.state.output_tecnico || 'Análisis de comportamiento',
              emotionalDubbing: location.state.output_emocional || location.state.translation,
              // Guardar el VIDEO COMPLETO con URL de Cloudinary
              mediaUrl: uploadResult.cloudinary.secure_url || uploadResult.cloudinary.url, // URL de Cloudinary
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
              fileSize: uploadResult.size || videoFile.size,
              fileName: videoFile.fileName,
              // Información adicional para videos
              isVideo: videoFile.isVideo,
              originalSize: videoFile.originalSize,
              thumbnail: videoFile.thumbnail,
              // Información de Cloudinary
              cloudinary: uploadResult.cloudinary,
              // Mantener blob URL original para reproducción inmediata (ya no es blob URL)
              originalVideoUrl: location.state.media?.data instanceof Blob ? URL.createObjectURL(location.state.media.data) : location.state.media?.data
            };

            // Guardar en la base de datos usando videoShareService
            console.log('💾 Guardando video en base de datos con URL de Cloudinary:', uploadResult.cloudinary.secure_url || uploadResult.cloudinary.url);
            const videoUrl = await videoShareService.storeVideoAndGenerateUrl(newVideo);
            console.log('✅ Video guardado en la base de datos:', videoUrl);
            console.log('🔍 Video object guardado:', newVideo);
            
            // Disparar evento personalizado para actualizar el feed
            console.log('🔄 Disparando evento de actualización del feed...');
            const feedUpdateEvent = new CustomEvent('feedUpdate', {
              detail: { 
                newVideo: newVideo,
                videoUrl: videoUrl,
                cloudinaryUrl: uploadResult.url,
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


  return (
    <div className="h-screen flex flex-col no-pull-refresh" style={{ backgroundColor: '#DC195C' }}>
      {/* Feed de la Comunidad */}
      <div className="flex-1 pb-16">
        <SharedFeed onVideoSelect={handleVideoSelect} />
      </div>

      {/* Bottom Navigation - Fixed */}
      <BottomNavigation />
    </div>
  );
};

export default Home;
