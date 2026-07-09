import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

// Crear directorio si no existe
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_PATH),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) return cb(null, true);
  return cb(new Error('Tipo de archivo no permitido. Solo imágenes (jpeg, jpg, png, webp)'), false);
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

export const handleUploadError = (err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'El archivo es demasiado grande', error: `El tamaño máximo es 5MB` });
      }
    }

    if (err.message && err.message.includes('Tipo de archivo no permitido')) {
      return res.status(400).json({ success: false, message: 'Tipo de archivo no permitido', error: err.message });
    }

    return res.status(500).json({ success: false, message: err.message });
  }
  next();
};

export default {
  upload,
  handleUploadError,
};
