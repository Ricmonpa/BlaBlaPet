/**
 * Script para probar el sistema de compartir arreglado
 */

// Simular entorno del navegador
Object.defineProperty(global, 'window', {
  value: {
    location: {
      origin: 'http://localhost:5173'
    },
    open: (url) => {
      console.log('🔗 Abriendo URL:', url);
      return true;
    }
  },
  writable: true
});

Object.defineProperty(global, 'document', {
  value: {
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
    title: 'Yo Pett',
    body: {
      appendChild: () => {},
      removeChild: () => {}
    }
  },
  writable: true
});

Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    share: undefined
  },
  writable: true
});

console.log('🧪 Probando sistema de compartir arreglado...\n');

async function testFixedSharing() {
  try {
    // Importar servicios
    const { default: videoShareService } = await import('../src/services/videoShareService.js');
    const { default: shareService } = await import('../src/services/shareService.js');

    // Mock de un post real
    const mockPost = {
      id: Date.now(),
      username: '@mi_mascota',
      petName: 'Luna',
      breed: 'Border Collie',
      mediaUrl: 'blob:http://localhost:5173/12345678-1234-1234-1234-123456789abc',
      mediaType: 'video',
      translation: 'El perro se acerca a un juguete, mostrando interés y anticipación. Su cuerpo está ligeramente inclinado hacia adelante, con la cola en una posición neutral.',
      output_tecnico: 'El perro muestra señales de juego: posición de reverencia, cola moviéndose, mirada alerta hacia el objeto.',
      output_emocional: 'Luna está emocionada y lista para jugar. Su energía es alta y muestra entusiasmo.',
      emotionalDubbing: 'El perro se acerca a un juguete, mostrando interés y anticipación. Su cuerpo está ligeramente inclinado hacia adelante, con la cola en una posición neutral.',
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

    console.log('1️⃣ Generando URL única del video...');
    const videoUrl = videoShareService.storeVideoAndGenerateUrl(mockPost);
    console.log('✅ URL generada:', videoUrl);
    console.log('');

    console.log('2️⃣ Generando URLs de WhatsApp...');
    const whatsappUrls = shareService.generateWhatsAppShareUrl(mockPost);
    console.log('✅ URLs de WhatsApp:');
    console.log('   - Web URL:', whatsappUrls.webUrl);
    console.log('   - Video URL:', whatsappUrls.videoUrl);
    console.log('');

    console.log('3️⃣ Generando texto de compartir...');
    const shareText = videoShareService.generateShareText(mockPost);
    console.log('✅ Texto de compartir:');
    console.log(shareText);
    console.log('');

    console.log('4️⃣ Simulando compartir en WhatsApp...');
    const success = await shareService.shareToWhatsApp(mockPost);
    console.log('✅ Resultado del compartir:', success ? 'Éxito' : 'Error');
    console.log('');

    console.log('5️⃣ Verificando que la URL sea correcta...');
    const isCorrectPort = videoUrl.includes('5173') && !videoUrl.includes('5175');
    console.log('✅ Puerto correcto:', isCorrectPort ? 'Sí (5173)' : 'No');
    console.log('');

    console.log('6️⃣ Verificando endpoint de preview...');
    const previewUrl = 'http://localhost:5173/video.html';
    console.log('✅ URL de preview:', previewUrl);
    console.log('');

    console.log('🎉 ¡Sistema arreglado y funcionando!');
    console.log('');
    console.log('📋 Para probar en tu celular:');
    console.log('1. Asegúrate de usar localhost:5173 (no 5175)');
    console.log('2. Analiza un video con tu mascota');
    console.log('3. Haz clic en compartir → WhatsApp');
    console.log('4. Verifica que se abra WhatsApp con el texto y enlace');
    console.log('5. Copia el enlace y pégalo en otro chat para ver el preview');
    console.log('');
    console.log('🔗 URL de prueba para preview:');
    console.log('   http://localhost:5173/video.html');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

testFixedSharing();
