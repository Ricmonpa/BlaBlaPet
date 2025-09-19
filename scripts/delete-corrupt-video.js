import fetch from 'node-fetch';

async function deleteCorruptVideo() {
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
      
      // Eliminar usando el endpoint correcto
      const deleteResponse = await fetch('https://blabla-pet-ai.vercel.app/api/videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: corruptVideo.id })
      });
      
      if (deleteResponse.ok) {
        const result = await deleteResponse.json();
        console.log('✅ Video deleted successfully:', result);
      } else {
        const error = await deleteResponse.text();
        console.log('❌ Delete failed:', error);
      }
    } else {
      console.log('✅ No corrupt videos found');
    }
    
    // Verificar feed limpio
    const finalResponse = await fetch('https://blabla-pet-ai.vercel.app/api/videos');
    const finalVideos = await finalResponse.json();
    
    console.log('📊 Final video count:', finalVideos.length);
    console.log('🎯 Feed status:', finalVideos.length === 0 ? 'CLEAN' : 'HAS_VIDEOS');
    
    if (finalVideos.length > 0) {
      console.log('📋 Remaining videos:');
      finalVideos.forEach(video => {
        console.log(`  - ${video.id}: ${video.mediaUrl}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error cleaning feed:', error);
  }
}

deleteCorruptVideo();
