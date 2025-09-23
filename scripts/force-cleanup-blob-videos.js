/**
 * Script para limpiar INMEDIATAMENTE todos los videos blob del localStorage
 * Esto elimina TODOS los videos blob sin importar su antigüedad
 */

console.log('🧹 LIMPIEZA FORZADA: Eliminando TODOS los videos blob...');

// Función para limpiar TODOS los videos blob
function forceCleanupBlobVideos() {
  try {
    const localVideos = JSON.parse(localStorage.getItem('localVideos') || '[]');
    const validVideos = [];
    let removedCount = 0;
    
    console.log(`📊 Videos encontrados: ${localVideos.length}`);
    
    localVideos.forEach(video => {
      const mediaUrl = video.mediaUrl;
      
      // Verificar si es una URL blob
      const isBlobUrl = mediaUrl && mediaUrl.startsWith('blob:');
      // Verificar si es una URL de Vercel Blob
      const isVercelBlobUrl = mediaUrl && mediaUrl.includes('blob.vercel-storage.com');
      
      // Remover TODOS los videos blob y de Vercel Blob
      if (isBlobUrl || isVercelBlobUrl) {
        console.log(`🚫 ELIMINANDO video blob/vercel: ${video.id}`);
        removedCount++;
      } else {
        console.log(`✅ MANTENIENDO video válido: ${video.id}`);
        validVideos.push(video);
      }
    });
    
    // Guardar solo videos válidos
    localStorage.setItem('localVideos', JSON.stringify(validVideos));
    
    console.log(`\n🧹 LIMPIEZA COMPLETADA:`);
    console.log(`📊 Total videos: ${localVideos.length}`);
    console.log(`🚫 Videos eliminados: ${removedCount}`);
    console.log(`✅ Videos restantes: ${validVideos.length}`);
    
    if (removedCount > 0) {
      console.log('\n🎉 ¡Todos los videos blob han sido eliminados!');
      console.log('🔄 Recarga la página para ver el feed limpio');
    } else {
      console.log('\n✅ No había videos blob para eliminar');
    }
    
    return {
      total: localVideos.length,
      removed: removedCount,
      remaining: validVideos.length
    };
    
  } catch (error) {
    console.error('❌ Error en limpieza forzada:', error);
    return { total: 0, removed: 0, remaining: 0, error: error.message };
  }
}

// Ejecutar limpieza inmediata
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  const result = forceCleanupBlobVideos();
  
  if (result.error) {
    console.error('❌ Error:', result.error);
  } else {
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('1. Recarga la página (F5)');
    console.log('2. El feed debería estar limpio');
    console.log('3. Graba un nuevo video para probar Cloudinary');
  }
} else {
  console.log('⚠️ Este script debe ejecutarse en el navegador');
  console.log('💡 Para usarlo:');
  console.log('1. Abre la consola del navegador (F12)');
  console.log('2. Copia y pega este script');
  console.log('3. Presiona Enter');
  console.log('4. Recarga la página');
}

console.log('\n🚀 ¡Limpieza forzada completada!');
