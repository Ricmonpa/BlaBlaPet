/**
 * Script para verificar que NO se crean blob URLs en la aplicación
 */

console.log('🔍 VERIFICANDO: No se crean blob URLs en la aplicación...');

// Interceptar URL.createObjectURL para detectar su uso
const originalCreateObjectURL = URL.createObjectURL;
let blobUrlCount = 0;

URL.createObjectURL = function(blob) {
  blobUrlCount++;
  console.error(`🚫 BLOB URL CREADO #${blobUrlCount}:`, blob);
  console.error('📍 Stack trace:', new Error().stack);
  
  // Llamar a la función original
  return originalCreateObjectURL.call(this, blob);
};

// Interceptar localStorage para detectar guardado de videos blob
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key === 'localVideos') {
    try {
      const videos = JSON.parse(value);
      const blobVideos = videos.filter(video => 
        video.mediaUrl && video.mediaUrl.startsWith('blob:')
      );
      
      if (blobVideos.length > 0) {
        console.error(`🚫 SE INTENTÓ GUARDAR ${blobVideos.length} VIDEOS BLOB EN LOCALSTORAGE!`);
        console.error('Videos blob:', blobVideos);
        console.error('📍 Stack trace:', new Error().stack);
      }
    } catch (e) {
      // Ignorar errores de parsing
    }
  }
  
  return originalSetItem.call(this, key, value);
};

console.log('✅ Interceptores configurados');
console.log('📊 Blob URLs creados hasta ahora:', blobUrlCount);

// Función para reportar estadísticas
window.reportBlobStats = function() {
  console.log('\n📊 ESTADÍSTICAS DE BLOB URLs:');
  console.log(`Total blob URLs creados: ${blobUrlCount}`);
  
  if (blobUrlCount === 0) {
    console.log('✅ ¡PERFECTO! No se han creado blob URLs');
  } else {
    console.log('❌ PROBLEMA: Se han creado blob URLs');
  }
  
  return blobUrlCount;
};

console.log('💡 Para ver estadísticas, ejecuta: reportBlobStats()');
console.log('🎯 Objetivo: 0 blob URLs creados');
