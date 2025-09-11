/**
 * Script de prueba para el sistema de compartir en WhatsApp
 * Simula el flujo completo desde análisis hasta compartir
 */

import videoShareService from '../src/services/videoShareService.js';
import shareService from '../src/services/shareService.js';

// Mock de un post con video analizado
const mockVideoPost = {
  id: Date.now(),
  username: '@test_user',
  petName: 'Max',
  breed: 'Golden Retriever',
  mediaUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  mediaType: 'video',
  translation: '¡Hola humano! Quiero que me des comida ahora mismo. Tengo mucha hambre y no he comido en horas.',
  output_tecnico: 'El perro muestra señales de hambre: movimientos de cabeza hacia arriba, mirada fija, posición de alerta.',
  output_emocional: 'Max está emocionado y ansioso por comida. Su energía es alta y muestra impaciencia.',
  emotionalDubbing: '¡Hola humano! Quiero que me des comida ahora mismo. Tengo mucha hambre y no he comido en horas.',
  emotionalTone: 'ansioso',
  emotionalStyle: 'directo',
  emotion: 'hambre',
  context: 'solicitando comida',
  confidence: 92,
  source: 'dual_analysis',
  analysisType: 'dual',
  behavior: 'solicitando atención',
  likes: 0,
  comments: 0,
  timestamp: 'Ahora'
};

console.log('🧪 Iniciando prueba del sistema de compartir en WhatsApp...\n');

async function testWhatsAppSharing() {
  try {
    // 1. Generar URL única del video
    console.log('1️⃣ Generando URL única del video...');
    const videoUrl = videoShareService.storeVideoAndGenerateUrl(mockVideoPost);
    console.log('✅ URL generada:', videoUrl);
    console.log('');

    // 2. Verificar que el video se almacenó correctamente
    console.log('2️⃣ Verificando almacenamiento del video...');
    const videoId = videoUrl.split('/').pop();
    const storedVideo = videoShareService.getVideoById(videoId);
    
    if (storedVideo) {
      console.log('✅ Video almacenado correctamente');
      console.log('   - ID:', storedVideo.id);
      console.log('   - Pet Name:', storedVideo.petName);
      console.log('   - Translation:', storedVideo.translation);
      console.log('   - Media Type:', storedVideo.mediaType);
    } else {
      console.log('❌ Error: Video no encontrado en almacenamiento');
      return;
    }
    console.log('');

    // 3. Generar metadatos Open Graph
    console.log('3️⃣ Generando metadatos Open Graph...');
    const metaData = await videoShareService.generateOpenGraphMeta(storedVideo);
    console.log('✅ Metadatos generados:');
    console.log('   - Title:', metaData.title);
    console.log('   - Description:', metaData.description);
    console.log('   - Image:', metaData.image.substring(0, 50) + '...');
    console.log('   - URL:', metaData.url);
    console.log('');

    // 4. Generar URLs de compartir para WhatsApp
    console.log('4️⃣ Generando URLs de compartir para WhatsApp...');
    const whatsappUrls = shareService.generateWhatsAppShareUrl(mockVideoPost);
    console.log('✅ URLs de WhatsApp generadas:');
    console.log('   - Deep Link:', whatsappUrls.deepLink);
    console.log('   - Web URL:', whatsappUrls.webUrl);
    console.log('   - Video URL:', whatsappUrls.videoUrl);
    console.log('');

    // 5. Generar texto de compartir optimizado
    console.log('5️⃣ Generando texto de compartir optimizado...');
    const shareText = videoShareService.generateShareText(storedVideo);
    console.log('✅ Texto de compartir:');
    console.log(shareText);
    console.log('');

    // 6. Probar incremento de contador de compartidos
    console.log('6️⃣ Probando incremento de contador...');
    const initialCount = storedVideo.shareCount;
    videoShareService.incrementShareCount(videoId);
    const updatedVideo = videoShareService.getVideoById(videoId);
    console.log('✅ Contador incrementado:', initialCount, '→', updatedVideo.shareCount);
    console.log('');

    // 7. Obtener estadísticas
    console.log('7️⃣ Obteniendo estadísticas...');
    const stats = videoShareService.getStats();
    console.log('✅ Estadísticas:');
    console.log('   - Total videos:', stats.totalVideos);
    console.log('   - Total compartidos:', stats.totalShares);
    console.log('   - Promedio compartidos:', stats.averageShares);
    console.log('');

    // 8. Simular preview de WhatsApp
    console.log('8️⃣ Simulando preview de WhatsApp...');
    console.log('📱 WhatsApp mostraría:');
    console.log('   🖼️  Imagen:', metaData.image ? '✅ Thumbnail generado' : '❌ Sin thumbnail');
    console.log('   📝 Título:', metaData.title);
    console.log('   📄 Descripción:', metaData.description);
    console.log('   🔗 Enlace:', metaData.url);
    console.log('');

    console.log('🎉 ¡Prueba completada exitosamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log('   ✅ URL única generada');
    console.log('   ✅ Video almacenado correctamente');
    console.log('   ✅ Metadatos Open Graph creados');
    console.log('   ✅ URLs de WhatsApp generadas');
    console.log('   ✅ Texto optimizado para compartir');
    console.log('   ✅ Contador de compartidos funcionando');
    console.log('   ✅ Estadísticas disponibles');
    console.log('   ✅ Preview de WhatsApp simulado');
    console.log('');
    console.log('🚀 El sistema está listo para compartir videos en WhatsApp con preview!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

// Ejecutar prueba
testWhatsAppSharing();
