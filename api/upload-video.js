import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        // Espera que el frontend envíe el archivo como base64 en data.fileBase64
        if (!data.fileBase64 || !data.filename || !data.contentType) {
          return res.status(400).json({ error: 'Missing fileBase64, filename, or contentType' });
        }
        // Decodificar base64 a buffer
        const fileBuffer = Buffer.from(data.fileBase64, 'base64');
        // Subir a Vercel Blob
        const blob = await put(data.filename, fileBuffer, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        return res.status(200).json({
          success: true,
          url: blob.url,
          filePath: data.filename,
          originalName: data.originalFilename || data.filename,
          size: fileBuffer.length,
          type: data.contentType
        });
      } catch (error) {
        console.error('💥 Error en upload endpoint:', error);
        return res.status(400).json({ error: error.message });
      }
    });
  } catch (error) {
    console.error('💥 Error en upload endpoint:', error);
    return res.status(400).json({ error: error.message });
  }
}