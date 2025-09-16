import { list, del } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧹 Iniciando limpieza de videos con URLs de Unsplash...');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN no está configurado' });
    }

    // Listar todos los metadatos de videos
    const blobs = await list({
      prefix: 'videos/',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`📋 Encontrados ${blobs.blobs.length} archivos de metadatos`);

    let deletedCount = 0;
    const videosToDelete = [];

    // Revisar cada archivo de metadatos
    for (const blob of blobs.blobs) {
      try {
        const response = await fetch(blob.url);
        if (response.ok) {
          const video = await response.json();
          
          // Verificar si tiene URL de Unsplash
          if (video.mediaUrl && video.mediaUrl.includes('unsplash.com')) {
            console.log(`🗑️ Video con Unsplash encontrado: ${video.id}`);
            videosToDelete.push(blob.pathname);
            deletedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error procesando ${blob.pathname}:`, error.message);
      }
    }

    // Eliminar videos con URLs de Unsplash
    for (const pathname of videosToDelete) {
      try {
        await del(pathname, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        console.log(`✅ Eliminado: ${pathname}`);
      } catch (error) {
        console.error(`❌ Error eliminando ${pathname}:`, error.message);
      }
    }

    console.log(`🎉 Limpieza completada. ${deletedCount} videos eliminados.`);

    return res.status(200).json({
      success: true,
      message: `Limpieza completada. ${deletedCount} videos eliminados.`,
      deletedCount,
      videosToDelete
    });
    
  } catch (error) {
    console.error('💥 Error en limpieza:', error);
    return res.status(500).json({ 
      error: error.message || 'Error en limpieza',
      details: error.stack
    });
  }
}
