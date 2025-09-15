import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import SharedFeed from '../components/SharedFeed';
import videoShareService from '../services/videoShareService.js';

/// Reemplaza tu función convertBlobToFile actual con esta versión:

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

    // NUEVO: Upload directo a Vercel Blob
    // Paso 1: Obtener URL de upload directo
    console.log('🔗 Obteniendo URL de upload directo...');
    
    const uploadUrlResponse = await fetch('/api/upload-video', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        filename: fileName,
        contentType: file.type,
        dogName: dogName, // Asegúrate de pasar dogName
        originalFilename: fileName,
        fileSize: file.size,
        videoMetadata: {/* puedes agregar más metadatos aquí si tienes */}
      })
    });

    if (!uploadUrlResponse.ok) {
      const errorData = await uploadUrlResponse.text();
      console.error('❌ Error obteniendo URL de upload:', errorData);
      throw new Error('Error obteniendo URL de upload directo');
    }

    const uploadData = await uploadUrlResponse.json();
    console.log('✅ URL de upload obtenida');

    // Paso 2: Subir archivo directamente a Vercel Blob
    console.log('⬆️ Subiendo archivo directamente a Blob Storage...');
    
    const uploadResponse = await fetch(uploadData.url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Error en upload directo:', errorText);
      throw new Error(`Error subiendo archivo: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    console.log('✅ Archivo subido exitosamente a Blob Storage');

    // La URL final será la URL sin query parameters
    const serverUrl = uploadData.url.split('?')[0];

    console.log('🔗 URL final del video:', serverUrl);

    if (mediaType === 'video') {
      // Crear thumbnail del video (mantener tu lógica existente)
      const thumbnail = await createVideoThumbnail(blob);
      
      return {
        file,
        url: serverUrl, // URL del Blob Storage
        fileName: uploadData.uniqueFilename, // Nombre único generado
        size: file.size,
        originalSize: file.size,
        isVideo: true,
        thumbnail: thumbnail,
        filePath: uploadData.uniqueFilename // Para compatibilidad con tu código existente
      };
    } else {
      return {
        file,
        url: serverUrl, // URL del Blob Storage
        fileName: uploadData.uniqueFilename, // Nombre único generado
        size: file.size,
        isVideo: false,
        filePath: uploadData.uniqueFilename // Para compatibilidad con tu código existente
      };
    }
  } catch (error) {
    console.error('Error convirtiendo blob a archivo:', error);
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
    if (location.state?.translation || location.state?.output_emocional || location.state?.isSequentialSubtitles) {
      const handleVideoSave = async () => {
        try {
          // Convertir blob URL a archivo real
          const videoFile = await convertBlobToFile(
            location.state.media?.data, 
            location.state.media?.type || 'video'
          );

          // Crear objeto de video para la base de datos
          const newVideo = {
            petName: 'Tu Mascota',
            translation: location.state.translation || location.state.output_tecnico || 'Análisis de comportamiento',
            emotionalDubbing: location.state.output_emocional || location.state.translation,
            // Guardar el VIDEO COMPLETO, no solo thumbnail
            mediaUrl: videoFile.url, // Video completo en base64
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
        } catch (error) {
          console.error('❌ Error guardando video:', error);
        }
      };

      handleVideoSave();

      // Limpiar el state para evitar duplicados
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Manejar selección de video
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    console.log('Video seleccionado:', video);
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#DC195C' }}>
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
