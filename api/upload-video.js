import { generateUploadUrl } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: true,
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
    const { filename, contentType, originalFilename } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Missing filename or contentType' });
    }
    // Generar URL de subida firmada
    const { url, token } = await generateUploadUrl(filename, {
      contentType,
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return res.status(200).json({
      success: true,
      uploadUrl: url,
      uploadToken: token,
      filePath: filename,
      originalName: originalFilename || filename,
      type: contentType
    });
  } catch (error) {
    console.error('💥 Error en upload endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}