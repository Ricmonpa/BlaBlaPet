/**
 * Script para probar el sistema de compartir en producción
 */

import videoShareService from '../src/services/videoShareService.js';
import shareService from '../src/services/shareService.js';

async function testProductionSharing() {
  console.log('🧪 Testing production sharing system...');
  
  // Simular un post de prueba
  const testPost = {
    id: Date.now(),
    username: '@test_user',
    petName: 'Test Pet',
    breed: 'Test Breed',
    mediaUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop',
    mediaType: 'photo',
    translation: 'Este es un video de prueba para verificar el funcionamiento en producción',
    emotionalDubbing: '¡Hola! Soy un video de prueba para producción!',
    emotionalTone: 'test',
    emotionalStyle: 'prueba',
    emotion: 'test',
    context: 'testing',
    confidence: 95,
    likes: 0,
    comments: 0,
    timestamp: 'Ahora'
  };
  
  try {
    console.log('📹 Creating test video...');
    const videoUrl = await videoShareService.storeVideoAndGenerateUrl(testPost);
    console.log('✅ Video URL generated:', videoUrl);
    
    console.log('📱 Generating WhatsApp share URL...');
    const shareData = await shareService.generateWhatsAppShareUrl(testPost);
    console.log('✅ Share data:', shareData);
    
    console.log('🔍 Verifying video can be retrieved...');
    const videoId = videoUrl.split('id=')[1];
    const retrievedVideo = await videoShareService.getVideoById(videoId);
    
    if (retrievedVideo) {
      console.log('✅ Video successfully retrieved:', retrievedVideo.id);
      console.log('📊 Video details:');
      console.log('  - Pet Name:', retrievedVideo.petName);
      console.log('  - Translation:', retrievedVideo.translation);
      console.log('  - Media URL:', retrievedVideo.mediaUrl);
    } else {
      console.log('❌ Failed to retrieve video');
    }
    
    console.log('📈 Storage stats:', videoShareService.getStats());
    
  } catch (error) {
    console.error('💥 Error in production sharing test:', error);
  }
}

// Función para probar URLs de diferentes entornos
function testEnvironmentDetection() {
  console.log('🌐 Testing environment detection...');
  
  const testUrls = [
    'http://localhost:5173',
    'http://localhost:5177',
    'https://blabla-pet-web.vercel.app',
    'https://blabla-pet-web-git-main.vercel.app'
  ];
  
  testUrls.forEach(url => {
    const mockWindow = { location: { hostname: new URL(url).hostname } };
    const isProduction = mockWindow.location.hostname.includes('vercel.app') || 
                        mockWindow.location.hostname.includes('blabla-pet-web') ||
                        mockWindow.location.hostname !== 'localhost';
    
    console.log(`  ${url} → ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
}

// Función para generar link de prueba
function generateTestLink() {
  const testVideoId = 'video_' + Date.now() + '_test123';
  const baseUrl = 'https://blabla-pet-web.vercel.app';
  const testLink = `${baseUrl}/video.html?id=${testVideoId}`;
  
  console.log('🔗 Test link generated:', testLink);
  console.log('📋 Copy this link to test in production:');
  console.log(`   ${testLink}`);
  
  return testLink;
}

// Exportar funciones
export {
  testProductionSharing,
  testEnvironmentDetection,
  generateTestLink
};

// Auto-ejecutar si se llama directamente
if (typeof require !== 'undefined' && require.main === module) {
  console.log('🚀 Running production sharing tests...');
  testEnvironmentDetection();
  generateTestLink();
  testProductionSharing();
}
