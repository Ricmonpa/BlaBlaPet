/**
 * Plugin de Vite para manejar previews de video con metadatos Open Graph dinámicos
 * Ahora lee datos reales del video desde la base de datos
 */

import { generateVideoPreviewHTML } from './src/api/video-preview.js';
import { getVideoDataFromDatabase, generateDynamicOpenGraphMeta } from './src/api/video-data.js';

export function videoPreviewPlugin() {
  return {
    name: 'video-preview',
    configureServer(server) {
      server.middlewares.use('/api/video-preview', async (req, res, next) => {
        const videoId = req.url.split('/')[1];
        
        if (videoId && videoId !== '') {
          try {
            console.log('🔍 Generando preview para video:', videoId);
            
            // Obtener datos del video desde la base de datos
            const video = await getVideoDataFromDatabase(videoId);
            
            // Generar metadatos dinámicos
            const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
            const metaData = generateDynamicOpenGraphMeta(video, baseUrl);
            
            // Generar HTML con metadatos dinámicos
            const html = generateVideoPreviewHTML(videoId, video, metaData);
            
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
            res.end(html);
            
            console.log('✅ Preview generado exitosamente para:', videoId);
          } catch (error) {
            console.error('❌ Error generando preview:', error);
            
            // Fallback a HTML genérico si hay error
            const html = generateVideoPreviewHTML(videoId, null, null);
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Cache-Control', 'public, max-age=60'); // Cache más corto para errores
            res.end(html);
          }
        } else {
          next();
        }
      });
    }
  };
}
