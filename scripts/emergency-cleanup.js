/**
 * SCRIPT DE EMERGENCIA: Limpiar TODOS los videos blob del localStorage
 * Ejecutar en la consola del navegador
 */

console.log('🚨 SCRIPT DE EMERGENCIA: Limpiando TODOS los videos blob...');

// Limpiar localStorage completamente
localStorage.removeItem('localVideos');
console.log('🧹 localStorage.locaVideos eliminado completamente');

// Verificar que esté limpio
const remainingVideos = JSON.parse(localStorage.getItem('localVideos') || '[]');
console.log(`✅ Videos restantes: ${remainingVideos.length}`);

console.log('🎉 ¡LIMPIEZA COMPLETA TERMINADA!');
console.log('🔄 Recarga la página (F5) para ver el feed limpio');
console.log('📤 Los nuevos videos se subirán a Cloudinary automáticamente');
