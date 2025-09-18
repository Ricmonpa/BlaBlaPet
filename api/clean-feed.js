import { list, del } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
  }

  try {
    if (req.method === 'GET') {
      // Listar todos los videos para inspección
      const blobs = await list({
        prefix: 'videos/',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      const videos = [];
      for (const blob of blobs.blobs || []) {
        try {
          const resp = await fetch(blob.url);
          if (resp.ok) {
            const videoData = await resp.json();
            videos.push({
              id: videoData.id,
              url: blob.url,
              mediaUrl: videoData.mediaUrl,
              createdAt: videoData.createdAt,
              petName: videoData.petName,
              isPublic: videoData.isPublic,
              blobName: blob.pathname
            });
          }
        } catch (error) {
          console.error('Error fetching video metadata:', error);
          videos.push({
            id: 'ERROR',
            url: blob.url,
            error: error.message,
            blobName: blob.pathname
          });
        }
      }

      return res.status(200).json({
        total: videos.length,
        videos: videos.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      });
    }

    if (req.method === 'DELETE') {
      // Eliminar video específico
      const { blobName } = req.body;
      
      if (!blobName) {
        return res.status(400).json({ error: 'blobName is required' });
      }

      console.log('🗑️ Deleting blob:', blobName);
      
      await del(blobName, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return res.status(200).json({ 
        success: true, 
        deleted: blobName,
        message: 'Video deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('💥 Error in /api/clean-feed:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}
