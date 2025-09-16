export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔍 Testing blob import...');
    
    // Test 1: Check if module can be imported
    let generateUploadUrl;
    try {
      const blobModule = await import('@vercel/blob');
      generateUploadUrl = blobModule.generateUploadUrl;
      console.log('✅ @vercel/blob imported successfully');
    } catch (importError) {
      console.error('❌ Failed to import @vercel/blob:', importError);
      return res.status(500).json({ 
        error: 'Failed to import @vercel/blob',
        importError: importError.message
      });
    }

    // Test 2: Check if function exists
    if (typeof generateUploadUrl !== 'function') {
      console.error('❌ generateUploadUrl is not a function:', typeof generateUploadUrl);
      return res.status(500).json({ 
        error: 'generateUploadUrl is not a function',
        type: typeof generateUploadUrl
      });
    }

    // Test 3: Check environment variable
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
    console.log('🔍 Token exists:', hasToken);
    console.log('🔍 Token length:', process.env.BLOB_READ_WRITE_TOKEN?.length || 0);

    if (!hasToken) {
      return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set' });
    }

    // Test 4: Try to call the function
    try {
      const result = await generateUploadUrl('test.mp4', {
        contentType: 'video/mp4',
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      
      console.log('✅ generateUploadUrl called successfully');
      
      return res.status(200).json({
        success: true,
        message: 'All tests passed',
        hasToken,
        tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
        result: {
          url: result.url ? 'Generated' : 'Missing',
          token: result.token ? 'Generated' : 'Missing'
        }
      });
    } catch (functionError) {
      console.error('❌ generateUploadUrl failed:', functionError);
      return res.status(500).json({ 
        error: 'generateUploadUrl function failed',
        functionError: functionError.message,
        stack: functionError.stack
      });
    }

  } catch (error) {
    console.error('💥 Test error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}
