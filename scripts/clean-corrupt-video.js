import fetch from 'node-fetch';

async function cleanCorruptVideo() {
  try {
    console.log('🔍 Checking current videos in feed...');
    
    // Obtener lista de videos
    const response = await fetch('https://blabla-pet-ai.vercel.app/api/videos');
    const videos = await response.json();
    
    console.log('📋 Current videos:', videos.length);
    
    // Encontrar video corrupto
    const corruptVideo = videos.find(video => 
      video.mediaUrl === 'https://example.com/test.mp4' || 
      video.id === 'video_1758150284734_hurrbe'
    );
    
    if (corruptVideo) {
      console.log('🗑️ Found corrupt video:', corruptVideo.id);
      console.log('🔗 Media URL:', corruptVideo.mediaUrl);
      
      // Intentar eliminar usando endpoint de confirmación
      const deleteResponse = await fetch('https://blabla-pet-ai.vercel.app/api/confirm-upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', videoId: corruptVideo.id })
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Video deleted successfully');
      } else {
        console.log('⚠️ Could not delete via API, manual cleanup needed');
      }
    } else {
      console.log('✅ No corrupt videos found');
    }
    
    // Verificar feed limpio
    const finalResponse = await fetch('https://blabla-pet-ai.vercel.app/api/videos');
    const finalVideos = await finalResponse.json();
    
    console.log('📊 Final video count:', finalVideos.length);
    console.log('🎯 Feed status:', finalVideos.length === 0 ? 'CLEAN' : 'HAS_VIDEOS');
    
  } catch (error) {
    console.error('❌ Error cleaning feed:', error);
  }
}

cleanCorruptVideo();
