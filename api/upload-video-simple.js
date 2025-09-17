import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';

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
    console.log('🔍 Upload request received');
    console.log('🔍 Request method:', req.method);
    console.log('🔍 Request headers:', req.headers);
    console.log('🔍 Content-Type:', req.headers['content-type']);

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set in environment.' });
    }

    // Parsear FormData usando formidable
    console.log('🔍 Parsing FormData...');
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
    });

    console.log('🔍 Starting form.parse...');
    const [fields, files] = await form.parse(req);
    console.log('✅ FormData parsed successfully');
    
    const file = files.file?.[0];
    const filename = fields.filename?.[0] || 'video.mp4';
    const contentType = fields.contentType?.[0] || 'video/mp4';
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Generar nombre único
    const extension = filename.split('.').pop() || 'mp4';
    const uniqueFilename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;

    console.log('🔍 Uploading file:', { uniqueFilename, contentType, size: file.size });

    // Leer el archivo
    const fileBuffer = await fs.promises.readFile(file.filepath);

    // Subir directamente a Vercel Blob
    const blob = await put(uniqueFilename, fileBuffer, {
      access: 'public',
      contentType: contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('✅ File uploaded successfully:', blob.url);

    // Limpiar archivo temporal
    await fs.promises.unlink(file.filepath);

    return res.status(200).json({
      success: true,
      url: blob.url,
      filePath: uniqueFilename,
      originalName: filename,
      type: contentType,
      size: file.size
    });

  } catch (error) {
    console.error('💥 Error en upload endpoint:', error);
    console.error('💥 Error stack:', error.stack);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}