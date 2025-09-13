export default function handler(req, res) {
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

  const fileId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fileName = `${fileId}.mp4`;
  const baseUrl = process.env.VITE_APP_URL || 'https://blabla-pet-web.vercel.app';
  
  res.json({
    success: true,
    url: `${baseUrl}/videos/${fileName}`,
    filePath: fileName,
    originalName: `video_${Date.now()}.mp4`,
    size: 0,
    type: 'video/mp4'
  });
}
