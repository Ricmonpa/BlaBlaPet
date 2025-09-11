/**
 * Plugin de Vite para manejar previews de video con metadatos Open Graph
 */

import { generateVideoPreviewHTML } from './src/api/video-preview.js';

export function videoPreviewPlugin() {
  return {
    name: 'video-preview',
    configureServer(server) {
      server.middlewares.use('/video', (req, res, next) => {
        const videoId = req.url.split('/')[1];
        
        if (videoId && videoId !== '') {
          // Generar HTML con metadatos Open Graph
          const html = generateVideoPreviewHTML(videoId);
          
          res.setHeader('Content-Type', 'text/html');
          res.setHeader('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
          res.end(html);
        } else {
          next();
        }
      });
    }
  };
}
