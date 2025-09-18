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
    console.log('🔍 Confirming upload completion...');

    const { filename, contentType, fileSize, uploadedUrl } = req.body;

    if (!filename || !uploadedUrl) {
      return res.status(400).json({ error: 'filename and uploadedUrl are required' });
    }

    console.log('✅ Upload confirmed:', { filename, contentType, fileSize, uploadedUrl });

    return res.status(200).json({
      success: true,
      url: uploadedUrl,
      filename: filename,
      contentType: contentType,
      fileSize: fileSize,
      message: 'Upload confirmed successfully'
    });

  } catch (error) {
    console.error('💥 Error confirming upload:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error'
    });
  }
}
