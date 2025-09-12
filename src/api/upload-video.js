/**
 * API endpoint para subir videos e imágenes al servidor
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function handleVideoUpload(req, res) {
  try {
    // Verificar que hay un archivo
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
    const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
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
}
