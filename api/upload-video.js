import { handleUpload } from '@vercel/blob/client';

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
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('📹 Iniciando upload de video dogparent:', body);

<<<<<<< HEAD
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
      type: file.mimetype
=======
    const jsonResponse = await handleUpload({
      body: body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log('🎫 Generando token para:', pathname);
        console.log('📋 Client payload:', clientPayload);
        // Validar dogName y metadata
        const payload = clientPayload ? JSON.parse(clientPayload) : {};
        // Elimina la validación estricta de dogName
        // if (!payload.dogName) {
        //   throw new Error('dogName es requerido en clientPayload');
        // }
        return {
          allowedContentTypes: [
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/x-msvideo',
            'video/mpeg'
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 200 * 1024 * 1024, // 200MB para videos largos
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
            dogName: payload.dogName || null,
            originalFilename: payload.originalFilename,
            fileSize: payload.fileSize,
            videoMetadata: payload.videoMetadata || {},
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('✅ Video subido exitosamente:', blob.url);
        console.log('📊 Token payload:', tokenPayload);
        try {
          // Aquí podrías guardar en la DB
          // const payload = JSON.parse(tokenPayload || '{}');
          // await saveVideoToDatabase({ ... });
          console.log('💾 Video guardado en DB (simulado)');
        } catch (error) {
          console.error('❌ Error guardando en DB:', error);
        }
      },
>>>>>>> 5b509d3c12939bd7601ac134285664d06fdeec4e
    });

    console.log('🚀 Upload response:', jsonResponse);
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('💥 Error en upload endpoint:', error);
    return res.status(400).json({ error: error.message });
  }
}