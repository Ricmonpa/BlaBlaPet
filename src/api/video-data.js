/**
 * Función para obtener datos del video desde la base de datos
 * Se ejecuta en el servidor para generar metadatos dinámicos
 */

export async function getVideoDataFromDatabase(videoId) {
  try {
    console.log('🔍 Obteniendo datos del video desde base de datos:', videoId);
    
    // URL de la base de datos JSON Server
    const dbUrl = 'http://localhost:3002/videos/' + videoId;
    
    // Hacer request a la base de datos
    const response = await fetch(dbUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ Video no encontrado en base de datos:', videoId);
        return null;
      }
      throw new Error(`Error obteniendo video: ${response.status} ${response.statusText}`);
    }
    
    const video = await response.json();
    console.log('✅ Video encontrado en base de datos:', video.id);
    
    return video;
  } catch (error) {
    console.error('❌ Error obteniendo datos del video:', error);
    return null;
  }
}

/**
 * Generar metadatos Open Graph dinámicos para WhatsApp
 * @param {Object} video - Datos del video
 * @param {string} baseUrl - URL base de la aplicación
 * @returns {Object} Metadatos Open Graph
 */
export function generateDynamicOpenGraphMeta(video, baseUrl) {
  if (!video) {
    // Metadatos por defecto si no se encuentra el video
    return {
      title: '¡Mira lo que dice mi mascota! 🐕 - Yo Pett',
      description: 'Análisis de comportamiento de mascota con Yo Pett - Traductor de mascotas',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
      url: `${baseUrl}/api/video-preview/not-found`,
      type: 'video.other',
      siteName: 'Yo Pett',
      locale: 'es_ES'
    };
  }
  
  // Generar metadatos dinámicos con datos reales del video
  const petName = video.petName || 'mi mascota';
  const translation = video.translation || video.emotionalDubbing || 'Análisis de comportamiento de mascota';
  const videoImage = video.mediaUrl || video.thumbnailUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop';
  
  const title = `¡Mira lo que dice ${petName}! 🐕`;
  const description = `"${translation}"`;
  
  return {
    title: `${title} - Yo Pett`,
    ogTitle: title,
    description: description,
    image: videoImage,
    url: `${baseUrl}/api/video-preview/${video.id}`,
    type: 'video.other',
    siteName: 'Yo Pett',
    locale: 'es_ES',
    imageWidth: '400',
    imageHeight: '600',
    imageType: 'image/jpeg'
  };
}
