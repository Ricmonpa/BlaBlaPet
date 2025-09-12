/**
 * Script de prueba para verificar metadatos dinámicos de WhatsApp
 * Este script debe ejecutarse en el navegador
 */

console.log('🧪 PRUEBA DE METADATOS DINÁMICOS PARA WHATSAPP');
console.log('📊 Verificando que los metadatos se generen correctamente en el servidor');
console.log('');

// Función para probar metadatos dinámicos
async function testDynamicMetadata() {
  console.log('🚀 Iniciando prueba de metadatos dinámicos...');
  console.log('');

  try {
    // 1. Crear un video de prueba con datos del modelo de pensamiento
    console.log('1️⃣ Creando video de prueba...');
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

    // 2. Guardar video usando videoShareService
    console.log('2️⃣ Guardando video usando videoShareService...');
    const videoUrl = await window.videoShareService.storeVideoAndGenerateUrl(testVideo);
    console.log('✅ Video guardado exitosamente');
    console.log('   - URL generada:', videoUrl);
    console.log('');

    // 3. Extraer videoId de la URL
    const videoId = videoUrl.split('/').pop();
    console.log('3️⃣ Video ID extraído:', videoId);
    console.log('');

    // 4. Probar endpoint de preview con metadatos dinámicos
    console.log('4️⃣ Probando endpoint de preview con metadatos dinámicos...');
    const previewUrl = `http://localhost:5173/api/video-preview/${videoId}`;
    console.log('   - Preview URL:', previewUrl);
    console.log('');

    // 5. Hacer request al endpoint y verificar metadatos
    console.log('5️⃣ Verificando metadatos generados en el servidor...');
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
    
    console.log('✅ Verificaciones:');
    console.log('   - Título dinámico:', isTitleCorrect ? '✅ CORRECTO' : '❌ INCORRECTO');
    console.log('   - Descripción dinámica:', isDescriptionCorrect ? '✅ CORRECTO' : '❌ INCORRECTO');
    console.log('   - Imagen dinámica:', isImageCorrect ? '✅ CORRECTO' : '❌ INCORRECTO');
    console.log('');

    // 7. Abrir preview en nueva pestaña
    console.log('7️⃣ Abriendo preview en nueva pestaña...');
    window.open(previewUrl, '_blank');
    console.log('');

    // 8. Probar compartir en WhatsApp
    console.log('8️⃣ Probando compartir en WhatsApp...');
    const shareText = `¡Mira lo que dice ${testVideo.petName}! 🐕\n\n"${testVideo.translation}"\n\nVer video: ${videoUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    
    console.log('   - Texto de compartir:', shareText);
    console.log('   - URL de WhatsApp:', whatsappUrl);
    console.log('   - Abriendo WhatsApp...');
    
    window.open(whatsappUrl, '_blank');
    console.log('');

    // 9. Resumen de la prueba
    console.log('📊 RESUMEN DE LA PRUEBA:');
    console.log('   ✅ Video creado con datos del modelo de pensamiento');
    console.log('   ✅ Video guardado en base de datos');
    console.log('   ✅ Metadatos generados dinámicamente en el servidor');
    console.log('   ✅ Título dinámico:', isTitleCorrect ? 'FUNCIONA' : 'FALLA');
    console.log('   ✅ Descripción dinámica:', isDescriptionCorrect ? 'FUNCIONA' : 'FALLA');
    console.log('   ✅ Imagen dinámica:', isImageCorrect ? 'FUNCIONA' : 'FALLA');
    console.log('   ✅ Preview abierto en nueva pestaña');
    console.log('   ✅ WhatsApp abierto con enlace');
    console.log('');
    
    if (isTitleCorrect && isDescriptionCorrect && isImageCorrect) {
      console.log('🎉 ¡METADATOS DINÁMICOS FUNCIONANDO PERFECTAMENTE!');
      console.log('   - WhatsApp ahora mostrará el preview correcto');
      console.log('   - Los metadatos se generan en el servidor');
      console.log('   - No hay dependencia de JavaScript del cliente');
      console.log('   - El modelo de pensamiento se preserva intacto');
    } else {
      console.log('❌ Algunos metadatos no se generaron correctamente');
      console.log('   - Revisar la implementación del servidor');
    }

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

// Función para verificar metadatos de un video específico
async function checkVideoMetadata(videoId) {
  console.log('🔍 Verificando metadatos del video:', videoId);
  
  try {
    const previewUrl = `http://localhost:5173/api/video-preview/${videoId}`;
    const response = await fetch(previewUrl);
    const html = await response.text();
    
    // Extraer metadatos
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const ogTitleMatch = html.match(/<meta property="og:title" content="(.*?)" \/>/);
    const ogDescriptionMatch = html.match(/<meta property="og:description" content="(.*?)" \/>/);
    const ogImageMatch = html.match(/<meta property="og:image" content="(.*?)" \/>/);
    
    console.log('📊 Metadatos del video:');
    console.log('   - Title:', titleMatch ? titleMatch[1] : 'No encontrado');
    console.log('   - OG Title:', ogTitleMatch ? ogTitleMatch[1] : 'No encontrado');
    console.log('   - OG Description:', ogDescriptionMatch ? ogDescriptionMatch[1] : 'No encontrado');
    console.log('   - OG Image:', ogImageMatch ? ogImageMatch[1] : 'No encontrado');
    
    // Abrir preview
    window.open(previewUrl, '_blank');
    
  } catch (error) {
    console.error('❌ Error verificando metadatos:', error);
  }
}

// Hacer las funciones disponibles globalmente
window.testDynamicMetadata = testDynamicMetadata;
window.checkVideoMetadata = checkVideoMetadata;

console.log('🚀 Para ejecutar la prueba completa, ejecuta:');
console.log('   testDynamicMetadata()');
console.log('');
console.log('🔍 Para verificar un video específico, ejecuta:');
console.log('   checkVideoMetadata("test_integration_1757633000")');
console.log('');
console.log('📋 O copia y pega este código en la consola del navegador:');
console.log('');
console.log(`
// Test de metadatos dinámicos
async function testMetadata() {
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
  
  window.open(previewUrl, '_blank');
}

testMetadata();
`);
