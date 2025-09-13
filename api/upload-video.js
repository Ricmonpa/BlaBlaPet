import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // Permitir que tu app web pueda usar esta API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Leer el archivo que envió el usuario
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Crear nombre único para el video
    const fileName = `video_${Date.now()}.mp4`;

    // Guardar en Vercel Blob (la nube)
    const blob = await put(fileName, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'video/mp4',
    });

    // Responder con éxito
    res.status(200).json({
      success: true,
      url: blob.url,
      filePath: fileName,
      size: buffer.length,
      type: 'video/mp4'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Error guardando video'
    });
  }
}