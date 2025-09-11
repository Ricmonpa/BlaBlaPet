/**
 * Script para debuggear el almacenamiento de videos
 */

// Función para verificar videos en localStorage
function debugVideoStorage() {
  console.log('🔍 Debugging video storage...');
  
  try {
    const storedVideos = localStorage.getItem('yo_pett_videos');
    console.log('📦 Raw localStorage data:', storedVideos);
    
    if (storedVideos) {
      const videos = JSON.parse(storedVideos);
      console.log('📹 Parsed videos:', videos);
      console.log('📊 Total videos stored:', Object.keys(videos).length);
      
      // Buscar el video específico
      const targetVideoId = 'video_1757608052329_';
      console.log(`🎯 Looking for video with pattern: ${targetVideoId}`);
      
      const matchingVideos = Object.keys(videos).filter(id => id.includes('1757608052329'));
      console.log('🔍 Matching video IDs:', matchingVideos);
      
      if (matchingVideos.length > 0) {
        const video = videos[matchingVideos[0]];
        console.log('✅ Found video:', video);
        console.log('📝 Video details:');
        console.log('  - ID:', video.id);
        console.log('  - Pet Name:', video.petName);
        console.log('  - Translation:', video.translation);
        console.log('  - Media URL:', video.mediaUrl);
        console.log('  - Created:', video.createdAt);
      } else {
        console.log('❌ No video found with ID containing 1757608052329');
        console.log('📋 Available video IDs:', Object.keys(videos));
      }
    } else {
      console.log('❌ No videos found in localStorage');
    }
  } catch (error) {
    console.error('💥 Error debugging video storage:', error);
  }
}

// Función para limpiar localStorage (solo para testing)
function clearVideoStorage() {
  console.log('🗑️ Clearing video storage...');
  localStorage.removeItem('yo_pett_videos');
  localStorage.removeItem('yo_pett_feed_posts');
  console.log('✅ Storage cleared');
}

// Función para simular un video de prueba
function createTestVideo() {
  console.log('🧪 Creating test video...');
  
  const testVideo = {
    id: 'video_1757608052329_test123',
    petName: 'Test Pet',
    breed: 'Test Breed',
    mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
    mediaType: 'photo',
    translation: 'Este es un video de prueba para verificar el funcionamiento del sistema',
    emotionalDubbing: '¡Hola! Soy un video de prueba!',
    emotionalTone: 'test',
    emotionalStyle: 'prueba',
    emotion: 'test',
    context: 'testing',
    confidence: 95,
    likes: 0,
    comments: 0,
    timestamp: 'Ahora',
    createdAt: new Date().toISOString(),
    shareCount: 0
  };
  
  const videos = JSON.parse(localStorage.getItem('yo_pett_videos') || '{}');
  videos[testVideo.id] = testVideo;
  localStorage.setItem('yo_pett_videos', JSON.stringify(videos));
  
  console.log('✅ Test video created:', testVideo.id);
  return testVideo.id;
}

// Exportar funciones para uso en consola
if (typeof window !== 'undefined') {
  window.debugVideoStorage = debugVideoStorage;
  window.clearVideoStorage = clearVideoStorage;
  window.createTestVideo = createTestVideo;
  
  console.log('🛠️ Debug functions available:');
  console.log('  - debugVideoStorage() - Ver videos almacenados');
  console.log('  - clearVideoStorage() - Limpiar almacenamiento');
  console.log('  - createTestVideo() - Crear video de prueba');
}

// Auto-ejecutar debug si se llama directamente
if (typeof require !== 'undefined' && require.main === module) {
  debugVideoStorage();
}
