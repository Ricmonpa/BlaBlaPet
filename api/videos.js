import { list, put } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
  }

  try {
    if (req.method === 'GET') {
      // Listar todos los metadatos guardados como blobs JSON
      const blobs = await list({
        prefix: 'videos/',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      const items = await Promise.all(
        (blobs.blobs || []).map(async (b) => {
          try {
            const resp = await fetch(b.url);
            return resp.ok ? await resp.json() : null;
          } catch {
            return null;
          }
        })
      );

      const videos = items.filter(Boolean).sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      return res.status(200).json(videos);
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }

      const now = new Date().toISOString();
      const id = body?.id || `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const newVideo = {
        ...body,
        id,
        createdAt: body?.createdAt || now,
        updatedAt: now,
      };

      const key = `videos/${id}.json`;
      await put(
        key,
        JSON.stringify(newVideo),
        {
          access: 'public',
          contentType: 'application/json',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }
      );

      return res.status(200).json(newVideo);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('💥 Error en /api/videos:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
