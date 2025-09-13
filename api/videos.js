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

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const db = readDB();

  if (req.method === 'GET') {
    res.json(db.videos || []);
  } else if (req.method === 'POST') {
    const newVideo = { ...req.body, id: `video_${Date.now()}` };
    db.videos = db.videos || [];
    db.videos.push(newVideo);
    writeDB(db);
    res.json(newVideo);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
