/**
 * Script para limpiar videos obsoletos del localStorage
 * Remueve videos con URLs de Vercel Blob y URLs blob expiradas
 */

console.log('🧹 Iniciando limpieza de videos obsoletos...');

// Función para limpiar videos obsoletos
function cleanupObsoleteVideos() {
  try {
    const localVideos = JSON.parse(localStorage.getItem('localVideos') || '[]');
    const validVideos = [];
    let removedCount = 0;
    
    console.log(`📊 Videos encontrados en localStorage: ${localVideos.length}`);
    
    localVideos.forEach(video => {
      const mediaUrl = video.mediaUrl;
      
      // Verificar si es una URL blob
      const isBlobUrl = mediaUrl && mediaUrl.startsWith('blob:');
      // Verificar si es una URL de Vercel Blob
      const isVercelBlobUrl = mediaUrl && mediaUrl.includes('blob.vercel-storage.com');
      
      // Remover URLs blob expiradas (más de 1 hora)
      if (isBlobUrl) {
        const videoDate = new Date(video.createdAt);
        const now = new Date();
        const ageInHours = (now - videoDate) / (1000 * 60 * 60);
        
        if (ageInHours > 1) {
          console.log(`🚫 Removiendo video con URL blob expirada: ${video.id} (${ageInHours.toFixed(1)}h)`);
          removedCount++;
        } else {
          console.log(`⏰ Manteniendo video blob reciente: ${video.id} (${ageInHours.toFixed(1)}h)`);
          validVideos.push(video);
        }
      } 
      // Remover URLs de Vercel Blob (ya no funcionan después de la migración)
      else if (isVercelBlobUrl) {
        console.log(`🚫 Removiendo video con URL de Vercel Blob: ${video.id}`);
        removedCount++;
      } 
      // Mantener videos con URLs válidas (Cloudinary, etc.)
      else {
        console.log(`✅ Manteniendo video válido: ${video.id}`);
        validVideos.push(video);
      }
    });
    
    if (removedCount > 0) {
      console.log(`🧹 Limpiados ${removedCount} videos obsoletos`);
      localStorage.setItem('localVideos', JSON.stringify(validVideos));
      console.log(`✅ ${validVideos.length} videos válidos restantes`);
    } else {
      console.log('✅ No se encontraron videos obsoletos para limpiar');
    }
    
    return {
      total: localVideos.length,
      removed: removedCount,
      remaining: validVideos.length
    };
    
  } catch (error) {
    console.error('❌ Error limpiando videos obsoletos:', error);
    return { total: 0, removed: 0, remaining: 0, error: error.message };
  }
}

// Ejecutar limpieza si estamos en el navegador
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  const result = cleanupObsoleteVideos();
  console.log('\n📊 Resumen de limpieza:');
  console.log(`Total videos: ${result.total}`);
  console.log(`Videos removidos: ${result.removed}`);
  console.log(`Videos restantes: ${result.remaining}`);
  
  if (result.error) {
    console.error('Error:', result.error);
  }
} else {
  console.log('⚠️ Este script debe ejecutarse en el navegador');
  console.log('💡 Para usarlo:');
  console.log('1. Abre la consola del navegador (F12)');
  console.log('2. Copia y pega el contenido de este script');
  console.log('3. Presiona Enter');
}

console.log('\n🎉 Limpieza completada!');
