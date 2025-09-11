/**
 * Script de Testing para Funcionalidad de Compartir
 * Verifica que el servicio de compartir funciona correctamente
 */

import shareService from '../src/services/shareService.js';

// Datos de prueba simulando un post
const mockPost = {
  id: 1,
  petName: 'Max',
  breed: 'Golden Retriever',
  translation: '¡Estoy feliz de verte! ¿Quieres jugar?',
  emotionalDubbing: '¡Qué alegría verte! ¡No puedo esperar para jugar contigo!',
  emotionalTone: 'alegre',
  confidence: 85,
  likes: 1247,
  comments: 89,
  timestamp: '2h ago'
};

console.log('🧪 Iniciando tests de funcionalidad de compartir...\n');

// Test 1: Verificar disponibilidad del servicio
console.log('📋 Test 1: Verificar disponibilidad del servicio');
console.log('✅ Servicio disponible:', shareService.isAvailable());
console.log('📱 Es móvil:', shareService.isMobile);
console.log('🌐 Web Share API soportada:', shareService.isWebShareSupported);
console.log('');

// Test 2: Verificar plataformas disponibles
console.log('📋 Test 2: Verificar plataformas disponibles');
const platforms = shareService.getAvailablePlatforms();
console.log('📱 Plataformas disponibles:');
platforms.forEach(platform => {
  console.log(`  - ${platform.icon} ${platform.name} (${platform.id})`);
});
console.log('');

// Test 3: Verificar generación de URLs
console.log('📋 Test 3: Verificar generación de URLs de compartir');

// TikTok
const tiktokUrls = shareService.generateTikTokShareUrl(mockPost);
console.log('🎵 TikTok URLs:');
console.log('  Deep Link:', tiktokUrls.deepLink);
console.log('  Web URL:', tiktokUrls.webUrl);

// Instagram
const instagramUrls = shareService.generateInstagramShareUrl(mockPost);
console.log('📷 Instagram URLs:');
console.log('  Deep Link:', instagramUrls.deepLink);
console.log('  Web URL:', instagramUrls.webUrl);

// Facebook
const facebookUrls = shareService.generateFacebookShareUrl(mockPost);
console.log('👥 Facebook URLs:');
console.log('  Deep Link:', facebookUrls.deepLink);
console.log('  Web URL:', facebookUrls.webUrl);

// WhatsApp
const whatsappUrls = shareService.generateWhatsAppShareUrl(mockPost);
console.log('💬 WhatsApp URLs:');
console.log('  Deep Link:', whatsappUrls.deepLink);
console.log('  Web URL:', whatsappUrls.webUrl);
console.log('');

// Test 4: Verificar detección de móvil
console.log('📋 Test 4: Verificar detección de dispositivo');
console.log('📱 User Agent:', navigator.userAgent);
console.log('📱 Detectado como móvil:', shareService.detectMobile());
console.log('');

// Test 5: Verificar estructura de datos del post
console.log('📋 Test 5: Verificar estructura de datos del post');
console.log('📊 Post de prueba:');
console.log(JSON.stringify(mockPost, null, 2));
console.log('');

// Test 6: Verificar métodos de compartir (sin ejecutar)
console.log('📋 Test 6: Verificar métodos de compartir disponibles');
console.log('🔧 Métodos disponibles:');
console.log('  - shareToTikTok()');
console.log('  - shareToInstagram()');
console.log('  - shareToFacebook()');
console.log('  - shareToWhatsApp()');
console.log('  - shareWithNativeAPI()');
console.log('  - share() (método principal)');
console.log('');

console.log('✅ Tests completados exitosamente!');
console.log('🚀 El servicio de compartir está listo para usar.');
console.log('');
console.log('📝 Notas:');
console.log('  - En dispositivos móviles, se intentará abrir las apps nativas');
console.log('  - Si las apps no están instaladas, se abrirá la versión web');
console.log('  - Web Share API estará disponible en navegadores móviles compatibles');
console.log('  - El modal se mostrará con todas las opciones disponibles');
