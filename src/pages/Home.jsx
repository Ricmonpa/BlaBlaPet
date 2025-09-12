import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import SharedFeed from '../components/SharedFeed';
import videoShareService from '../services/videoShareService.js';

// Función para convertir blob URL a archivo real optimizado
const convertBlobToFile = async (blobData, mediaType) => {
  try {
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

    // Subir archivo al servidor
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', mediaType);

    const uploadResponse = await fetch('http://localhost:3003/api/upload-video', {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      throw new Error('Error subiendo archivo al servidor');
    }

    const uploadResult = await uploadResponse.json();
    const serverUrl = uploadResult.url;

    if (mediaType === 'video') {
      // Crear thumbnail del video
      const thumbnail = await createVideoThumbnail(blob);
      
      return {
        file,
        url: serverUrl, // URL del servidor
        fileName,
        size: file.size,
        originalSize: file.size,
        isVideo: true,
        thumbnail: thumbnail,
        filePath: uploadResult.filePath
      };
    } else {
      return {
        file,
        url: serverUrl, // URL del servidor
        fileName,
        size: file.size,
        isVideo: false,
        filePath: uploadResult.filePath
      };
    }
  } catch (error) {
    console.error('Error convirtiendo blob a archivo:', error);
    // Fallback a imagen estática
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
