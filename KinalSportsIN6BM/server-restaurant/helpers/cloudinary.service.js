import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const buildOptions = (publicId, extraOptions = {}) => ({
  public_id: publicId,
  folder: process.env.CLOUDINARY_FOLDER,
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
});

export const uploadImage = async (input, publicId, extraOptions = {}) => {
  try {
    const options = buildOptions(publicId, extraOptions);
    let result;

    if (Buffer.isBuffer(input)) {
      result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, res) => {
          if (error) reject(error);
          else resolve(res);
        });
        stream.end(input);
      });
    } else {
      result = await cloudinary.uploader.upload(input, options);
    }

    if (result.error) throw new Error(result.error.message);

    return result.public_id;
  } catch (error) {
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
