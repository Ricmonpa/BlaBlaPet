/**
 * Servidor Express para manejar subida de archivos
 */

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de video e imagen'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
    files: 1
  }
});

// Endpoint para subir archivos
app.post('/api/upload-video', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${fileId}${fileExtension}`;
    const filePath = path.join(process.cwd(), 'public', 'videos', fileName);

    // Crear directorio si no existe
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Guardar archivo
    fs.writeFileSync(filePath, file.buffer);

    // Generar URL del servidor
    const baseUrl = 'http://localhost:5173';
    const serverUrl = `${baseUrl}/videos/${fileName}`;

    res.json({
      success: true,
      url: serverUrl,
      filePath: fileName,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para servir videos
app.get('/videos/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'public', 'videos', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Determinar content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Upload server running on port ${PORT}`);
});

export default app;
