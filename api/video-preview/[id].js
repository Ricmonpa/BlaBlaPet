import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'database.json');

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { videos: [] };
  }
}

export default function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Video ID required' });
  }

  const db = readDB();
  const video = db.videos?.find(v => v.id === id);

  const title = video ? `¡Mira lo que dice ${video.petName || 'mi mascota'}! 🐕` : 'Video de mascota';
  const description = video?.translation || 'Análisis de comportamiento de mascota';
  const image = video?.mediaUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=600&fit=crop';

  const html = `<!DOCTYPE html>
<html>
<head>
    <title>${title} - Yo Pett</title>
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">
    <meta property="og:url" content="${process.env.VITE_APP_URL || 'https://blabla-pet-web.vercel.app'}/api/video-preview/${id}">
    <meta property="og:type" content="video.other">
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <img src="${image}" alt="Video preview" style="max-width: 400px;">
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}
