export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 DEBUG - Request method:', req.method);
    console.log('🔍 DEBUG - Request body type:', typeof req.body);
    console.log('🔍 DEBUG - Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 DEBUG - BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
    console.log('🔍 DEBUG - BLOB_READ_WRITE_TOKEN length:', process.env.BLOB_READ_WRITE_TOKEN?.length || 0);

    return res.status(200).json({
      success: true,
      method: req.method,
      bodyType: typeof req.body,
      body: req.body,
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0
    });
  } catch (error) {
    console.error('💥 DEBUG Error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}
