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
    console.log('Processing upload request...');
    
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    console.log('Fields:', fields);
    console.log('Files:', Object.keys(files));

    // Obtener el archivo
    const file = files.file?.[0];
    if (!file) {
      throw new Error('No file found in upload');
    }

    console.log('File info:', {
      originalFilename: file.originalFilename,
      mimetype: file.mimetype,
      size: file.size,
      filepath: file.filepath
    });

    // Leer el archivo
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Generar nombre único manteniendo extensión
    const extension = file.originalFilename?.split('.').pop() || 'mp4';
    const fileName = `video_${Date.now()}.${extension}`;

    console.log('Uploading to Vercel Blob:', fileName);

    // Subir a Vercel Blob
    const blob = await put(fileName, fileBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Limpiar archivo temporal
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.warn('Could not clean up temp file:', cleanupError.message);
    }

    console.log('Upload successful:', blob.url);

    return res.status(200).json({
      success: true,
      url: blob.url,
      filePath: fileName,
      originalName: file.originalFilename,
      size: file.size,
      type: fields.type?.[0] || 'unknown'
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    
    // Si es un error de parsing, dar más detalles
    if (error.message.includes('maxFileSize')) {
      return res.status(413).json({ 
        error: 'File too large. Maximum size is 100MB.',
        details: error.message
      });
    }
    
    return res.status(500).json({ 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
}