/**
 * Script de prueba para compartir en móvil
 * Simula el flujo real de la aplicación
 */

// Simular entorno móvil
Object.defineProperty(global, 'window', {
  value: {
    location: {
      origin: 'http://192.168.1.100:5173', // IP local para móvil
      href: 'http://192.168.1.100:5173'
    }
  },
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    share: undefined // Simular que no hay Web Share API
  },
  writable: true
});

global.document = {
  createElement: (tag) => {
    if (tag === 'video') {
      return {
        addEventListener: () => {},
        currentTime: 0,
        duration: 10,
        crossOrigin: null,
        src: '',
        remove: () => {}
      };
    }
    if (tag === 'canvas') {
      return {
        getContext: () => ({
          drawImage: () => {},
          toDataURL: () => 'data:image/jpeg;base64,test'
        }),
        width: 400,
        height: 600,
        remove: () => {}
      };
    }
    return {};
  },
  head: {
    appendChild: () => {},
    querySelectorAll: () => []
  },
  title: 'Yo Pett'
};

// Mock de un post real de la aplicación
const mockRealPost = {
  id: Date.now(),
  username: '@mi_mascota',
  petName: 'Luna',
  breed: 'Border Collie',
  mediaUrl: 'blob:http://192.168.1.100:5173/12345678-1234-1234-1234-123456789abc', // URL de blob real
  mediaType: 'video',
  translation: '¡Hola! Quiero jugar contigo. ¿Puedes lanzarme la pelota?',
  output_tecnico: 'El perro muestra señales de juego: posición de reverencia, cola moviéndose, mirada alerta hacia el objeto.',
  output_emocional: 'Luna está emocionada y lista para jugar. Su energía es alta y muestra entusiasmo.',
  emotionalDubbing: '¡Hola! Quiero jugar contigo. ¿Puedes lanzarme la pelota?',
  emotionalTone: 'emocionado',
  emotionalStyle: 'juguetón',
  emotion: 'juego',
  context: 'solicitando juego',
  confidence: 88,
  source: 'dual_analysis',
  analysisType: 'dual',
  behavior: 'invitación al juego',
  likes: 0,
  comments: 0,
  timestamp: 'Ahora'
};

console.log('📱 Probando sistema de compartir en móvil...\n');

async function testMobileSharing() {
  try {
    // Importar servicios
    const { default: videoShareService } = await import('../src/services/videoShareService.js');
    const { default: shareService } = await import('../src/services/shareService.js');

    console.log('1️⃣ Generando URL única del video...');
    const videoUrl = videoShareService.storeVideoAndGenerateUrl(mockRealPost);
    console.log('✅ URL generada:', videoUrl);
    console.log('');

    console.log('2️⃣ Generando URLs de WhatsApp...');
    const whatsappUrls = shareService.generateWhatsAppShareUrl(mockRealPost);
    console.log('✅ URLs de WhatsApp:');
    console.log('   - Deep Link:', whatsappUrls.deepLink);
    console.log('   - Web URL:', whatsappUrls.webUrl);
    console.log('   - Video URL:', whatsappUrls.videoUrl);
    console.log('');

    console.log('3️⃣ Generando texto de compartir...');
    const shareText = videoShareService.generateShareText(mockRealPost);
    console.log('✅ Texto de compartir:');
    console.log(shareText);
    console.log('');

    console.log('4️⃣ Simulando clic en WhatsApp...');
    console.log('📱 Al hacer clic en WhatsApp se abrirá:');
    console.log('   URL:', whatsappUrls.webUrl);
    console.log('   Texto:', decodeURIComponent(whatsappUrls.webUrl.split('text=')[1]));
    console.log('');

    console.log('5️⃣ Verificando metadatos Open Graph...');
    const videoId = videoUrl.split('/').pop();
    const storedVideo = videoShareService.getVideoById(videoId);
    const metaData = await videoShareService.generateOpenGraphMeta(storedVideo);
    
    console.log('✅ Metadatos para preview:');
    console.log('   - Título:', metaData.title);
    console.log('   - Descripción:', metaData.description);
    console.log('   - Imagen:', metaData.image ? '✅ Generada' : '❌ Error');
    console.log('   - URL:', metaData.url);
    console.log('');

    console.log('🎉 ¡Sistema funcionando correctamente!');
    console.log('');
    console.log('📋 Para probar en tu celular:');
    console.log('1. Asegúrate de que tu celular esté en la misma red WiFi');
    console.log('2. Accede a la IP que muestra el servidor de desarrollo');
    console.log('3. Analiza un video con tu mascota');
    console.log('4. Haz clic en el botón de compartir (ícono de compartir)');
    console.log('5. Selecciona WhatsApp');
    console.log('6. Verifica que se abra WhatsApp con el texto y enlace');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.log('');
    console.log('🔧 Posibles soluciones:');
    console.log('1. Verificar que el servidor esté corriendo');
    console.log('2. Verificar que la IP sea accesible desde el móvil');
    console.log('3. Verificar que no haya errores en la consola del navegador');
  }
}

testMobileSharing();
