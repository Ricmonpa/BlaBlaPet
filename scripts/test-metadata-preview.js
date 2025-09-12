/**
 * Script de prueba para verificar metadatos dinámicos de WhatsApp
 * Este script debe ejecutarse en el navegador
 */

console.log('🧪 PRUEBA DE METADATOS DINÁMICOS PARA WHATSAPP');
console.log('📱 Verificando que el preview de WhatsApp muestre datos reales del video');
console.log('');

// Función para crear un video de prueba y verificar metadatos
function testMetadataPreview() {
  console.log('1️⃣ Creando video de prueba...');
  
  // Crear un video de prueba con datos reales
  const testVideo = {
    id: 'test_metadata_video_123',
    petName: 'Luna',
    translation: '¡Quiero salir a pasear! 🐕',
    emotionalDubbing: 'El perro está expresando ganas de salir y hacer ejercicio',
    mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
    mediaType: 'video',
    createdAt: new Date().toISOString(),
    shareCount: 0
  };
  
  // Guardar en localStorage
  const storedVideos = JSON.parse(localStorage.getItem('yo_pett_videos') || '{}');
  storedVideos[testVideo.id] = testVideo;
  localStorage.setItem('yo_pett_videos', JSON.stringify(storedVideos));
  
  console.log('✅ Video de prueba creado y guardado');
  console.log('   - Pet Name:', testVideo.petName);
  console.log('   - Translation:', testVideo.translation);
  console.log('   - Media URL:', testVideo.mediaUrl);
  console.log('');
  
  // Generar URL de preview
  const baseUrl = window.location.origin;
  const previewUrl = `${baseUrl}/api/video-preview/${testVideo.id}`;
  
  console.log('2️⃣ URL de preview generada:');
  console.log('   ', previewUrl);
  console.log('');
  
  // Abrir la URL de preview en una nueva pestaña
  console.log('3️⃣ Abriendo preview en nueva pestaña...');
  window.open(previewUrl, '_blank');
  
  console.log('4️⃣ Verificando metadatos...');
  console.log('   - Abre la pestaña del preview');
  console.log('   - Abre las herramientas de desarrollador (F12)');
  console.log('   - Ve a la pestaña "Elements" o "Elementos"');
  console.log('   - Busca los meta tags og:title, og:description, og:image');
  console.log('   - Deberían mostrar los datos reales del video:');
  console.log('     * og:title: "¡Mira lo que dice Luna! 🐕"');
  console.log('     * og:description: "¡Quiero salir a pasear! 🐕"');
  console.log('     * og:image: URL de la imagen del video');
  console.log('');
  
  // Función para verificar metadatos programáticamente
  function verifyMetadata() {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    console.log('🔍 Verificación de metadatos:');
    console.log('   og:title:', ogTitle ? ogTitle.getAttribute('content') : 'No encontrado');
    console.log('   og:description:', ogDescription ? ogDescription.getAttribute('content') : 'No encontrado');
    console.log('   og:image:', ogImage ? ogImage.getAttribute('content') : 'No encontrado');
    
    // Verificar si los metadatos son dinámicos
    const expectedTitle = '¡Mira lo que dice Luna! 🐕';
    const expectedDescription = '¡Quiero salir a pasear! 🐕';
    
    const titleCorrect = ogTitle && ogTitle.getAttribute('content') === expectedTitle;
    const descriptionCorrect = ogDescription && ogDescription.getAttribute('content') === expectedDescription;
    
    if (titleCorrect && descriptionCorrect) {
      console.log('✅ Metadatos dinámicos funcionando correctamente!');
    } else {
      console.log('❌ Metadatos no se actualizaron correctamente');
      console.log('   - Título esperado:', expectedTitle);
      console.log('   - Descripción esperada:', expectedDescription);
    }
  }
  
  // Hacer la función disponible globalmente
  window.verifyMetadata = verifyMetadata;
  
  console.log('5️⃣ Para verificar metadatos, ejecuta en la consola:');
  console.log('   verifyMetadata()');
  console.log('');
  
  console.log('6️⃣ Para probar en WhatsApp:');
  console.log('   - Copia la URL del preview');
  console.log('   - Pégalo en un chat de WhatsApp');
  console.log('   - Debería mostrar el preview con los datos reales del video');
  console.log('');
  
  return previewUrl;
}

// Hacer la función disponible globalmente
window.testMetadataPreview = testMetadataPreview;

console.log('🚀 Para ejecutar la prueba, abre la consola del navegador y ejecuta:');
console.log('   testMetadataPreview()');
console.log('');
console.log('📋 O copia y pega este código en la consola del navegador:');
console.log('');
console.log(`
// Test de metadatos dinámicos
const testVideo = {
  id: 'test_metadata_video_123',
  petName: 'Luna',
  translation: '¡Quiero salir a pasear! 🐕',
  mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
  mediaType: 'video'
};

const storedVideos = JSON.parse(localStorage.getItem('yo_pett_videos') || '{}');
storedVideos[testVideo.id] = testVideo;
localStorage.setItem('yo_pett_videos', JSON.stringify(storedVideos));

const previewUrl = window.location.origin + '/api/video-preview/' + testVideo.id;
console.log('Preview URL:', previewUrl);
window.open(previewUrl, '_blank');
`);
