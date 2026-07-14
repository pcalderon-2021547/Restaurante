import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath, publicId, extraOptions = {}) => {
  try {
    const folder = process.env.CLOUDINARY_FOLDER;
    const options = {
      public_id: publicId,
      folder,
      resource_type: 'image',
      transformation: extraOptions.isAvatar
        ? [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ]
        : [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
      ...extraOptions,
    };

    const result = await cloudinary.uploader.upload(filePath, options);

    // Eliminar archivo local después de subir
    try { await fs.unlink(filePath); } catch {}

    if (result.error) throw new Error(result.error.message);

    // devolver public_id completo (folder/filename)
    return result.public_id;
  } catch (error) {
    try { await fs.unlink(filePath); } catch {}
    throw new Error(error?.message || 'Error uploading image');
  }
};

export const deleteImage = async (imageIdentifier) => {
  try {
    if (!imageIdentifier) return true;

    // Si es URL pública no intentamos borrar en Cloudinary
    if (imageIdentifier.startsWith('http://') || imageIdentifier.startsWith('https://')) {
      return true;
    }

    const folder = process.env.CLOUDINARY_FOLDER;
    const publicId = imageIdentifier.includes('/') ? imageIdentifier : `${folder}/${imageIdentifier}`;
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok' || result.result === 'not found' || result.result === 'deleted' || result.result === 'success';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error?.message || error);
    return false;
  }
};

export const getFullImageUrl = (imageIdentifier) => {
  const base = process.env.CLOUDINARY_BASE_URL || `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;

  if (!imageIdentifier) return getDefaultAvatarUrl();

  // Si ya es URL pública
  if (imageIdentifier.startsWith('http://') || imageIdentifier.startsWith('https://')) {
    return imageIdentifier;
  }

  // Si coincide con el default avatr path
  const defaultAvatar = process.env.CLOUDINARY_DEFAULT_AVATAR || process.env.CLOUDINARY_DEFAULT_AVATAR_FILENAME;
  if (!imageIdentifier) return defaultAvatar ? `${base}${defaultAvatar}` : null;

  if (!imageIdentifier.includes('/')) {
    const folder = process.env.CLOUDINARY_FOLDER;
    return `${base}${folder}/${imageIdentifier}`;
  }

  return `${base}${imageIdentifier}`;
};

export const getDefaultAvatarUrl = () => {
  const defaultPath = process.env.CLOUDINARY_DEFAULT_AVATAR || `${process.env.CLOUDINARY_FOLDER}/${process.env.CLOUDINARY_DEFAULT_AVATAR_FILENAME}`;
  const base = process.env.CLOUDINARY_BASE_URL || `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (!defaultPath) return null;
  return `${base}${defaultPath}`;
};

export default {
  uploadImage,
  deleteImage,
  getFullImageUrl,
  getDefaultAvatarUrl,
};
