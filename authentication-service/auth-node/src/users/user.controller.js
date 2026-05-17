import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { findUserById } from '../../helpers/user-db.js';
import {
  getUserRoleNames,
  getUsersByRole as repoGetUsersByRole,
  setUserSingleRole,
} from '../../helpers/role-db.js';
import { ALLOWED_ROLES, ADMIN_ROLE } from '../../helpers/role-constants.js';
import { buildUserResponse } from '../../utils/user-helpers.js';
import { sequelize } from '../../configs/db.js';
import { User, UserProfile } from './user.model.js';
import { upload, handleUploadError } from '../../helpers/file-upload.js';
import {
  uploadImage,
  deleteImage,
  getDefaultAvatarPath,
} from '../../helpers/cloudinary-service.js';
import { FileValidator } from '../../helpers/file-validator.js';

const ensureAdmin = async (req) => {
  const currentUserId = req.userId;
  if (!currentUserId) return false;
  const roles =
    req.user?.UserRoles?.map((ur) => ur.Role?.Name).filter(Boolean) ??
    (await getUserRoleNames(currentUserId));
  return roles.includes(ADMIN_ROLE);
};

// PUT /api/v1/users/:userId/role
export const updateUserRole = [
  validateJWT,
  asyncHandler(async (req, res) => {
    if (!(await ensureAdmin(req))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { userId } = req.params;
    const { roleName } = req.body || {};

    const normalized = (roleName || '').trim().toUpperCase();
    if (!ALLOWED_ROLES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: 'Role not allowed. Use ADMIN_ROLE or USER_ROLE',
      });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { updatedUser } = await setUserSingleRole(user, normalized, sequelize);
    return res.status(200).json(buildUserResponse(updatedUser));
  }),
];

// PUT /api/v1/users/:userId  — editar datos + foto de perfil
export const updateUserProfile = [
  validateJWT,
  upload.single('profilePicture'),
  handleUploadError,
  asyncHandler(async (req, res) => {
    if (!(await ensureAdmin(req))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { userId } = req.params;
    const { name, surname, username, phone } = req.body || {};

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const transaction = await sequelize.transaction();

    try {
      // Campos del usuario principal
      const userUpdates = {};
      if (name?.trim())    userUpdates.Name    = name.trim();
      if (surname?.trim()) userUpdates.Surname = surname.trim();
      if (username?.trim()) {
        const existing = await User.findOne({
          where: { Username: username.trim().toLowerCase() },
          transaction,
        });
        if (existing && existing.Id !== userId) {
          await transaction.rollback();
          return res.status(409).json({ success: false, message: 'El username ya está en uso' });
        }
        userUpdates.Username = username.trim().toLowerCase();
      }
      if (Object.keys(userUpdates).length > 0) {
        await User.update(userUpdates, { where: { Id: userId }, transaction });
      }

      // Campos del perfil
      const profileUpdates = {};
      if (phone?.trim()) profileUpdates.Phone = phone.trim();

      if (req.file) {
        const { isValid, errorMessage } = FileValidator.validateImage(req.file);
        if (!isValid) {
          await transaction.rollback();
          return res.status(400).json({ success: false, message: errorMessage });
        }
        const oldPicture = user.UserProfile?.ProfilePicture;
        const defaultPath = getDefaultAvatarPath();
        if (oldPicture && oldPicture !== defaultPath && !oldPicture.includes('default')) {
          await deleteImage(oldPicture).catch(() => {});
        }
        const fileName = FileValidator.generateSecureFileName(req.file.originalname);
        const uploadedPath = await uploadImage(req.file.path, fileName);
        profileUpdates.ProfilePicture = uploadedPath;
      }

      if (Object.keys(profileUpdates).length > 0) {
        await UserProfile.update(profileUpdates, { where: { UserId: userId }, transaction });
      }

      await transaction.commit();

      const updatedUser = await findUserById(userId);
      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: buildUserResponse(updatedUser),
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating user profile:', error);
      return res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
    }
  }),
];

// GET /api/v1/users/:userId/roles
export const getUserRoles = [
  validateJWT,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const roles = await getUserRoleNames(userId);
    return res.status(200).json(roles);
  }),
];

// GET /api/v1/users/by-role/:roleName
export const getUsersByRole = [
  validateJWT,
  asyncHandler(async (req, res) => {
    if (!(await ensureAdmin(req))) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const { roleName } = req.params;
    const normalized = (roleName || '').trim().toUpperCase();
    if (!ALLOWED_ROLES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: 'Role not allowed. Use ADMIN_ROLE or USER_ROLE',
      });
    }
    const users = await repoGetUsersByRole(normalized);
    return res.status(200).json(users.map(buildUserResponse));
  }),
];
