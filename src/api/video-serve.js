/**
 * API endpoint para servir videos reales desde archivos
 */

import fs from 'fs';
import path from 'path';

export function serveVideo(videoId) {
  try {
    // Buscar el video en la base de datos
    const dbPath = path.join(process.cwd(), 'db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const video = db.videos?.find(v => v.id === videoId);
    
    if (!video) {
      return { error: 'Video not found', status: 404 };
    }

    // Si el video tiene un archivo real, servirlo
    if (video.filePath) {
      const videoPath = path.join(process.cwd(), 'public', 'videos', video.filePath);
      
      if (fs.existsSync(videoPath)) {
        const videoBuffer = fs.readFileSync(videoPath);
        return {
          data: videoBuffer,
          contentType: video.mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
          status: 200
        };
      }
    }

    // Fallback: si no hay archivo real, devolver error
    return { error: 'Video file not found', status: 404 };
    
  } catch (error) {
    console.error('Error serving video:', error);
    return { error: 'Internal server error', status: 500 };
  }
}
