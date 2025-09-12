/**
 * Script de prueba para verificar el compartir en WhatsApp corregido
 * Este script debe ejecutarse en el navegador, no en Node.js
 */

console.log('🧪 PRUEBA DE WHATSAPP SHARING - VERSIÓN SIMPLIFICADA');
console.log('📱 Para móviles: Intentará abrir WhatsApp app, fallback a WhatsApp Web');
console.log('💻 Para desktop: Abrirá directamente WhatsApp Web');
console.log('');

// Mock de un post de video para pruebas
const mockVideoPost = {
  id: 'test_post_123',
  petName: 'Max',
  translation: '¡Hola! Quiero jugar contigo 🐕',
  emotionalDubbing: 'El perro está expresando alegría y ganas de jugar',
  mediaUrl: 'https://example.com/video.mp4',
  mediaType: 'video',
  timestamp: 'Ahora',
  likes: 0,
  comments: 0
};

// Función para probar el compartir (debe ejecutarse en el navegador)
function testWhatsAppSharing() {
  console.log('🔍 Detectando dispositivo...');
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log(`📱 Es móvil: ${isMobile}`);
  console.log('');

  // Generar texto de compartir
  const shareText = `¡Mira lo que dice ${mockVideoPost.petName}! 🐕\n\n"${mockVideoPost.translation}"\n\n#YoPett #Perros #Mascotas\n\nVer video completo:\nhttp://localhost:5173/api/video-preview/test_post_123`;
  const encodedText = encodeURIComponent(shareText);
  
  console.log('📝 Texto de compartir generado:');
  console.log(shareText);
  console.log('');

  // Generar URLs
  const deepLink = `whatsapp://send?text=${encodedText}`;
  const webUrl = `https://wa.me/?text=${encodedText}`;
  
  console.log('🔗 URLs generadas:');
  console.log('   Deep Link:', deepLink);
  console.log('   Web URL:', webUrl);
  console.log('');

  if (isMobile) {
    console.log('📱 MÓVIL: Intentando abrir WhatsApp app...');
    console.log('   Si WhatsApp está instalado, se abrirá la app');
    console.log('   Si no está instalado, se abrirá WhatsApp Web');
    
    // Intentar deep link con fallback
    try {
      window.location.href = deepLink;
      
      // Fallback después de 1.5 segundos
      setTimeout(() => {
        console.log('   Fallback: Abriendo WhatsApp Web...');
        window.open(webUrl, '_blank');
      }, 1500);
    } catch (error) {
      console.log('   Error con deep link, abriendo WhatsApp Web...');
      window.open(webUrl, '_blank');
    }
  } else {
    console.log('💻 DESKTOP: Abriendo WhatsApp Web directamente...');
    window.open(webUrl, '_blank');
  }
  
  console.log('');
  console.log('✅ Prueba ejecutada! Revisa si se abrió WhatsApp correctamente.');
}

// Hacer la función disponible globalmente para ejecutar en la consola del navegador
window.testWhatsAppSharing = testWhatsAppSharing;

console.log('🚀 Para ejecutar la prueba, abre la consola del navegador y ejecuta:');
console.log('   testWhatsAppSharing()');
console.log('');
console.log('📋 O copia y pega este código en la consola del navegador:');
console.log('');
console.log(`
// Test de WhatsApp Sharing
const mockVideoPost = {
  petName: 'Max',
  translation: '¡Hola! Quiero jugar contigo 🐕'
};

const shareText = \`¡Mira lo que dice \${mockVideoPost.petName}! 🐕\\n\\n"\${mockVideoPost.translation}"\\n\\n#YoPett #Perros #Mascotas\\n\\nVer video completo:\\nhttp://localhost:5173/api/video-preview/test_post_123\`;
const encodedText = encodeURIComponent(shareText);
const deepLink = \`whatsapp://send?text=\${encodedText}\`;
const webUrl = \`https://wa.me/?text=\${encodedText}\`;

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
  console.log('📱 Móvil: Intentando WhatsApp app...');
  window.location.href = deepLink;
  setTimeout(() => window.open(webUrl, '_blank'), 1500);
} else {
  console.log('💻 Desktop: Abriendo WhatsApp Web...');
  window.open(webUrl, '_blank');
}
`);
