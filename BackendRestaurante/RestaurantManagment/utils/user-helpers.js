import { getFullImageUrl, getDefaultAvatarUrl } from '../helpers/cloudinary.service.js';

export const buildUserResponse = (user) => {
  if (!user) return null;
  const u = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  return {
    ...u,
    profilePicture: getFullImageUrl(u.avatar || getDefaultAvatarUrl()),
  };
};

export default { buildUserResponse };
