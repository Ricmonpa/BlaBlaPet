/**
 * Utilidades para compresión de video
 * Reduce el tamaño de archivos de video para evitar límites de Vercel
 */

/**
 * Comprimir video usando Canvas API
 * @param {Blob} videoBlob - Blob del video original
 * @param {Object} options - Opciones de compresión
 * @returns {Promise<Blob>} Video comprimido
 */
export async function compressVideo(videoBlob, options = {}) {
  const {
    maxSizeMB = 4, // Máximo 4MB (dentro del límite de Vercel)
    quality = 0.7, // Calidad de compresión (0.1 - 1.0)
    maxWidth = 720, // Ancho máximo
    maxHeight = 1280 // Alto máximo
  } = options;

  try {
    console.log('🎬 Iniciando compresión de video...');
    console.log('📁 Tamaño original:', (videoBlob.size / 1024 / 1024).toFixed(2), 'MB');

    // Si el video ya es pequeño, no comprimir
    if (videoBlob.size <= maxSizeMB * 1024 * 1024) {
      console.log('✅ Video ya es pequeño, no necesita compresión');
      return videoBlob;
    }

    // Crear video element para obtener metadata
    const video = document.createElement('video');
    const videoUrl = URL.createObjectURL(videoBlob);
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        console.log('📐 Dimensiones originales:', video.videoWidth, 'x', video.videoHeight);
        
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = calculateDimensions(
          video.videoWidth, 
          video.videoHeight, 
          maxWidth, 
          maxHeight
        );
        
        console.log('📐 Dimensiones comprimidas:', width, 'x', height);

        // Crear canvas para compresión
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        // Configurar video para el frame actual
        video.currentTime = 0;
        video.onloadeddata = () => {
          // Dibujar frame en canvas
          ctx.drawImage(video, 0, 0, width, height);
          
          // Convertir canvas a blob con compresión
          canvas.toBlob((compressedBlob) => {
            URL.revokeObjectURL(videoUrl);
            
            if (compressedBlob) {
              console.log('✅ Video comprimido:', (compressedBlob.size / 1024 / 1024).toFixed(2), 'MB');
              console.log('📊 Reducción:', ((1 - compressedBlob.size / videoBlob.size) * 100).toFixed(1), '%');
              resolve(compressedBlob);
            } else {
              reject(new Error('Error en compresión de video'));
            }
          }, 'video/mp4', quality);
        };

        video.onerror = () => {
          URL.revokeObjectURL(videoUrl);
          reject(new Error('Error cargando video para compresión'));
        };
      };

      video.src = videoUrl;
    });

  } catch (error) {
    console.error('❌ Error en compresión de video:', error);
    // Si falla la compresión, devolver el video original
    return videoBlob;
  }
}

/**
 * Calcular dimensiones manteniendo aspect ratio
 * @param {number} originalWidth - Ancho original
 * @param {number} originalHeight - Alto original
 * @param {number} maxWidth - Ancho máximo
 * @param {number} maxHeight - Alto máximo
 * @returns {Object} Nuevas dimensiones
 */
function calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  // Reducir ancho si es necesario
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  // Reducir alto si es necesario
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Comprimir video de forma más agresiva si es necesario
 * @param {Blob} videoBlob - Blob del video
 * @returns {Promise<Blob>} Video comprimido
 */
export async function compressVideoAggressive(videoBlob) {
  console.log('🎬 Compresión agresiva de video...');
  
  // Intentar compresión normal primero
  let compressedBlob = await compressVideo(videoBlob, {
    maxSizeMB: 3,
    quality: 0.6,
    maxWidth: 640,
    maxHeight: 1136
  });
  
  // Si aún es muy grande, comprimir más
  if (compressedBlob.size > 3 * 1024 * 1024) {
    console.log('🎬 Aplicando compresión adicional...');
    compressedBlob = await compressVideo(compressedBlob, {
      maxSizeMB: 2,
      quality: 0.4,
      maxWidth: 480,
      maxHeight: 854
    });
  }
  
  return compressedBlob;
}

/**
 * Verificar si un video necesita compresión
 * @param {Blob} videoBlob - Blob del video
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {boolean} true si necesita compresión
 */
export function needsCompression(videoBlob, maxSizeMB = 4) {
  return videoBlob.size > maxSizeMB * 1024 * 1024;
}
