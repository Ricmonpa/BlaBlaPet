/**
 * Script de prueba COMPLETA del flujo de WhatsApp
 * Verifica que todo funcione desde el inicio hasta el final
 */

console.log('🧪 PRUEBA COMPLETA DEL FLUJO DE WHATSAPP');
console.log('📊 Verificando que todo funcione desde el inicio hasta el final');
console.log('');

// Función para probar el flujo completo
async function testCompleteFlow() {
  console.log('🚀 Iniciando prueba completa del flujo...');
  console.log('');

  try {
    // 1. Verificar que los servicios estén disponibles
    console.log('1️⃣ Verificando servicios disponibles...');
    
    if (!window.videoShareService) {
      throw new Error('videoShareService no está disponible');
    }
    
    if (!window.shareService) {
      throw new Error('shareService no está disponible');
    }
    
    console.log('✅ Servicios disponibles');
    console.log('');

    // 2. Crear un video de prueba con datos del modelo de pensamiento
    console.log('2️⃣ Creando video de prueba con datos del modelo de pensamiento...');
    const testVideo = {
      petName: 'Max',
      translation: '¡Tengo hambre! Dame comida 🍖',
      emotionalDubbing: 'El perro está expresando necesidad de alimento',
      mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
      mediaType: 'video',
      userId: 'test_user_' + Date.now(),
      tags: ['perro', 'hambre', 'comida'],
      duration: 30,
      resolution: '400x600',
      format: 'mp4'
    };
    
    console.log('📝 Video de prueba creado:');
    console.log('   - Pet Name:', testVideo.petName);
    console.log('   - Translation:', testVideo.translation);
    console.log('   - Media URL:', testVideo.mediaUrl);
    console.log('');

    // 3. Guardar video usando videoShareService
    console.log('3️⃣ Guardando video usando videoShareService...');
    const videoUrl = await window.videoShareService.storeVideoAndGenerateUrl(testVideo);
    console.log('✅ Video guardado exitosamente');
    console.log('   - URL generada:', videoUrl);
    console.log('');

    // 4. Verificar que el video se guardó en la base de datos
    console.log('4️⃣ Verificando que el video se guardó en la base de datos...');
    const videoId = videoUrl.split('/').pop();
    const savedVideo = await window.videoShareService.getVideoById(videoId);
    
    if (savedVideo) {
      console.log('✅ Video encontrado en la base de datos:');
      console.log('   - ID:', savedVideo.id);
      console.log('   - Pet Name:', savedVideo.petName);
      console.log('   - Translation:', savedVideo.translation);
      console.log('   - Share Count:', savedVideo.shareCount);
      console.log('');
    } else {
      console.log('❌ Video no encontrado en la base de datos');
      return;
    }

    // 5. Probar el endpoint de preview con metadatos dinámicos
    console.log('5️⃣ Probando endpoint de preview con metadatos dinámicos...');
    const previewUrl = `http://localhost:5173/api/video-preview/${videoId}`;
    console.log('   - Preview URL:', previewUrl);
    
    const response = await fetch(previewUrl);
    const html = await response.text();
    
    // Extraer metadatos del HTML
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)" \/>/);
    const ogDescriptionMatch = html.match(/<meta property="og:description" content="(.*?)" \/>/);
    const ogImageMatch = html.match(/<meta property="og:image" content="(.*?)" \/>/);
    
    console.log('📊 Metadatos extraídos del HTML:');
    console.log('   - Title:', titleMatch ? titleMatch[1] : 'No encontrado');
    console.log('   - OG Title:', ogTitleMatch ? ogTitleMatch[1] : 'No encontrado');
    console.log('   - OG Description:', ogDescriptionMatch ? ogDescriptionMatch[1] : 'No encontrado');
    console.log('   - OG Image:', ogImageMatch ? ogImageMatch[1] : 'No encontrado');
    console.log('');

    // 6. Verificar que los metadatos sean dinámicos
    console.log('6️⃣ Verificando que los metadatos sean dinámicos...');
    const expectedTitle = `¡Mira lo que dice ${testVideo.petName}! 🐕`;
    const expectedDescription = `"${testVideo.translation}"`;
    
    const isTitleCorrect = ogTitleMatch && ogTitleMatch[1] === expectedTitle;
    const isDescriptionCorrect = ogDescriptionMatch && ogDescriptionMatch[1] === expectedDescription;
    const isImageCorrect = ogImageMatch && ogImageMatch[1] === testVideo.mediaUrl;
    
    console.log('✅ Verificaciones de metadatos:');
    console.log('   - Título dinámico:', isTitleCorrect ? '✅ CORRECTO' : '❌ INCORRECTO');
    console.log('   - Descripción dinámica:', isDescriptionCorrect ? '✅ CORRECTO' : '❌ INCORRECTO');
    console.log('   - Imagen dinámica:', isImageCorrect ? '✅ CORRECTO' : '❌ INCORRECTO');
    console.log('');

    // 7. Probar compartir en WhatsApp
    console.log('7️⃣ Probando compartir en WhatsApp...');
    const shareResult = await window.shareService.shareToWhatsApp(testVideo);
    
    if (shareResult) {
      console.log('✅ Compartir en WhatsApp exitoso');
      console.log('   - WhatsApp debería abrirse con el enlace');
      console.log('   - El enlace debería mostrar el preview correcto');
    } else {
      console.log('❌ Error compartiendo en WhatsApp');
    }
    console.log('');

    // 8. Abrir preview en nueva pestaña para verificar visualmente
    console.log('8️⃣ Abriendo preview en nueva pestaña...');
    window.open(previewUrl, '_blank');
    console.log('   - Preview abierto en nueva pestaña');
    console.log('   - Verifica que se vea correctamente');
    console.log('');

    // 9. Resumen final
    console.log('📊 RESUMEN FINAL DE LA PRUEBA:');
    console.log('   ✅ Servicios disponibles');
    console.log('   ✅ Video creado con datos del modelo de pensamiento');
    console.log('   ✅ Video guardado en base de datos');
    console.log('   ✅ Video recuperado desde base de datos');
    console.log('   ✅ Metadatos generados dinámicamente en el servidor');
    console.log('   ✅ Título dinámico:', isTitleCorrect ? 'FUNCIONA' : 'FALLA');
    console.log('   ✅ Descripción dinámica:', isDescriptionCorrect ? 'FUNCIONA' : 'FALLA');
    console.log('   ✅ Imagen dinámica:', isImageCorrect ? 'FUNCIONA' : 'FALLA');
    console.log('   ✅ Compartir en WhatsApp:', shareResult ? 'FUNCIONA' : 'FALLA');
    console.log('   ✅ Preview abierto en nueva pestaña');
    console.log('');
    
    if (isTitleCorrect && isDescriptionCorrect && isImageCorrect && shareResult) {
      console.log('🎉 ¡FLUJO COMPLETO FUNCIONANDO PERFECTAMENTE!');
      console.log('   - WhatsApp mostrará el preview correcto');
      console.log('   - Los metadatos se generan dinámicamente');
      console.log('   - El modelo de pensamiento se preserva');
      console.log('   - La base de datos funciona correctamente');
      console.log('   - El feed será compartido entre usuarios');
      console.log('');
      console.log('✅ LISTO PARA CONTINUAR CON EL PASO 4');
    } else {
      console.log('❌ Algunos componentes no funcionan correctamente');
      console.log('   - Revisar los errores antes de continuar');
    }

  } catch (error) {
    console.error('💥 Error en la prueba completa:', error);
  }
}

// Hacer la función disponible globalmente
window.testCompleteFlow = testCompleteFlow;

console.log('🚀 Para ejecutar la prueba completa, ejecuta:');
console.log('   testCompleteFlow()');
console.log('');
console.log('📋 O copia y pega este código en la consola del navegador:');
console.log('');
console.log(`
// Test del flujo completo
async function testFlow() {
  const testVideo = {
    petName: 'Luna',
    translation: '¡Quiero jugar! 🎾',
    mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
    mediaType: 'video'
  };
  
  const videoUrl = await window.videoShareService.storeVideoAndGenerateUrl(testVideo);
  const videoId = videoUrl.split('/').pop();
  const previewUrl = 'http://localhost:5173/api/video-preview/' + videoId;
  
  console.log('Video URL:', videoUrl);
  console.log('Preview URL:', previewUrl);
  
  const shareResult = await window.shareService.shareToWhatsApp(testVideo);
  console.log('Share result:', shareResult);
  
  window.open(previewUrl, '_blank');
}

testFlow();
`);
