/**
 * Middleware de Multer para manejar subida de archivos
 */

import multer from 'multer';

// Configurar multer para almacenar archivos en memoria
const storage = multer.memoryStorage();

// Configurar filtros de archivos
const fileFilter = (req, file, cb) => {
  // Permitir videos e imágenes
  if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de video e imagen'), false);
  }
};

// Configurar límites
const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB máximo
  files: 1 // Solo un archivo por vez
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

export default upload;
