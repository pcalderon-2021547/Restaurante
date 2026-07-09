'use strict'

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../user/user.js';
import { uploadImage, deleteImage, getFullImageUrl, getDefaultAvatarUrl } from '../../../helpers/cloudinary.service.js';
import { renderEmailTemplate } from '../../utils/reactEmailTemplate.js';
import { sendEmail } from '../../../utils/send-email.js';

const isValidUrl = (value) => {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const verifyEmailTemplate = (verifyLink) => renderEmailTemplate({
  title: 'Verifica tu cuenta — Gestión Restaurante',
  preheader: 'Activa tu cuenta y comienza a gestionar tu restaurante.',
  heading: 'Bienvenido a Gestión Restaurante',
  intro: 'Gracias por registrarte. Solo falta un paso para activar tu cuenta y acceder a tu panel administrativo.',
  paragraphs: [
    'Presiona el botón para verificar tu correo electrónico y completar el registro.',
    'Este enlace te permitirá ingresar al sistema y gestionar tus restaurantes, menús y pedidos con estilo.'
  ],
  buttonText: 'Verificar mi cuenta',
  buttonUrl: verifyLink,
  fallbackText: 'Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:',
  fallbackUrl: verifyLink,
  notice: 'Si no solicitaste esta cuenta, puedes ignorar este correo. Gracias por usar Gestión Restaurante.'
});

const resendVerificationTemplate = (verifyLink) => renderEmailTemplate({
  title: 'Reenvío de verificación — Gestión Restaurante',
  preheader: 'Recibiste un nuevo enlace para confirmar tu correo.',
  heading: 'Tu verificación está lista',
  intro: 'Hemos generado un nuevo enlace para que confirmes tu correo y sigas usando tu cuenta.',
  paragraphs: [
    'Haz clic en el botón para completar la verificación y volver a tu panel administrativo.',
    'Este enlace confirma que tu correo electrónico es válido y protege tu acceso.'
  ],
  buttonText: 'Confirmar mi correo',
  buttonUrl: verifyLink,
  fallbackText: 'Pega el enlace en tu navegador si el botón no funciona:',
  fallbackUrl: verifyLink,
  notice: 'Si no solicitaste este correo, simplemente ignóralo. Tu cuenta no sufrirá ningún cambio.'
});

const resetPasswordTemplate = (resetLink) => renderEmailTemplate({
  title: 'Restablece tu contraseña — Gestión Restaurante',
  preheader: 'Te ayudamos a recuperar el acceso a tu cuenta de Gestión Restaurante.',
  heading: 'Recupera tu contraseña',
  intro: 'Recibimos tu solicitud para cambiar la contraseña de tu cuenta. Usa el botón a continuación para continuar.',
  paragraphs: [
    'Este enlace te llevará a una página segura donde podrás ingresar una nueva contraseña.',
    'Si no solicitaste este cambio, puedes ignorar este correo con total seguridad.'
  ],
  buttonText: 'Restablecer contraseña',
  buttonUrl: resetLink,
  fallbackText: 'Si el botón no carga, copia y pega este enlace en tu navegador:',
  fallbackUrl: resetLink,
  notice: 'Por seguridad, este enlace solo es válido por 1 hora. Solicita uno nuevo si expira.'
});


/* ===========================
   REGISTER
=========================== */

export const register = async (req, res) => {
    try {

    const { name, surname, username, email, password, phone, profilePictureUrl } = req.body;
    let avatarPublicId = null;

        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);
        const emailToken = crypto.randomBytes(32).toString('hex');

        const totalUsers = await User.count();
        const role = totalUsers === 0 ? 'ADMIN_ROLE' : 'USER_ROLE';

    // Si viene archivo subido
    if (req.file) {
      try {
        const publicId = `profile-${Date.now()}`;
        const uploadedId = await uploadImage(req.file.path, publicId);
        avatarPublicId = uploadedId;
      } catch (err) {
        console.warn('Error uploading profile picture, using default avatar', err.message || err);
      }
    } else if (profilePictureUrl) {
      if (!isValidUrl(profilePictureUrl)) {
        return res.status(400).json({ success: false, message: 'profilePictureUrl no es una URL válida' });
      }
      // Si mandan URL pública, almacenamos la URL completa en avatarPublicId
      avatarPublicId = profilePictureUrl;
    }

    if (!avatarPublicId) {
      avatarPublicId = getDefaultAvatarUrl();
    }

    const user = await User.create({
      name,
      surname,
      username,
      email,
      phone,
      password: encryptedPassword,
      role,
      emailToken,
      emailVerified: false,
      avatar: avatarPublicId
    });

    try {
      await sendEmail(
        email,
        'Verifica tu cuenta — Gestión Restaurante',
        verifyEmailTemplate(verifyLink)
      );

      return res.status(201).json({
        success: true,
        message: 'Usuario creado. Revisa tu correo para verificar tu cuenta.'
      });
    } catch (mailError) {
      console.warn('Unable to send verification email, auto-verifying local account:', mailError.message || mailError);
      user.emailVerified = true;
      user.emailToken = null;
      await user.save();

      return res.status(201).json({
        success: true,
        message: 'Usuario creado y verificado automáticamente para pruebas locales.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
    try {

        const identifier = (req.body.emailOrUsername || req.body.email || req.body.username || '').trim();
        const { password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Correo o usuario y contrasena son obligatorios'
            });
        }

        const user = await User.findOne({
            where: identifier.includes('@')
                ? { email: identifier.toLowerCase() }
                : { username: identifier }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Debes verificar tu correo primero'
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const payload = {
            sub: user.id,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            success: true,
            token
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error en login',
            error: error.message
        });
    }
};


/* ===========================
   VERIFY EMAIL
=========================== */

export const verifyEmail = async (req, res) => {
    try {

        const token = req.body?.token || req.query?.token;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const user = await User.findOne({
            where: { emailToken: token }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido'
            });
        }

        user.emailVerified = true;
        user.emailToken = null;

        await user.save();

        return res.json({
            success: true,
            message: 'Correo verificado correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================
   RESEND VERIFICATION EMAIL
=========================== */

export const resendVerification = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Debes proporcionar un correo'
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'La cuenta ya está verificada'
            });
        }

        const newEmailToken = crypto.randomBytes(32).toString('hex');
        user.emailToken = newEmailToken;
        await user.save();

        const verifyLink =
            `http://localhost:${process.env.PORT}/restaurantManagement/v1/auth/verify-email?token=${newEmailToken}`;

        await sendEmail(user.email, 'Nuevo enlace de verificación — Gestión Restaurante', resendVerificationTemplate(verifyLink));

        return res.json({
            success: true,
            message: 'Correo de verificación reenviado correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================
   REQUEST RESET PASSWORD
=========================== */

export const requestPasswordReset = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No existe usuario con ese correo'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000;

        await user.save();

        const resetLink =
            `http://localhost:${process.env.PORT}/restaurantManagement/v1/auth/reset-password?token=${resetToken}`;

        await sendEmail(user.email, 'Recuperación de contraseña — Gestión Restaurante', resetPasswordTemplate(resetLink));

        return res.json({
            success: true,
            message: 'Correo de recuperación enviado'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ===========================
   RESET PASSWORD
=========================== */

export const resetPassword = async (req, res) => {
    try {

        const { token, newPassword } = req.body;

        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: {
                    [Op.gt]: Date.now()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 10);

        user.password = encryptedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;

        await user.save();

        return res.json({
            success: true,
            message: 'Contraseña restablecida correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ===========================
   LIST USERS (ADMIN)
=========================== */

export const listUsers = async (req, res) => {
    try {

        const { page = 1, limit = 10 } = req.query;

        const safePage = Math.max(parseInt(page, 10) || 1, 1);
        const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
        const offset = (safePage - 1) * safeLimit;

        const { rows, count } = await User.findAndCountAll({
            attributes: { exclude: ['password', 'emailToken', 'resetToken', 'resetTokenExpiration', 'deleteToken', 'deleteTokenExpiration'] },
            limit: safeLimit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                currentPage: safePage,
                totalPages: Math.ceil(count / safeLimit),
                totalRecords: count,
                limit: safeLimit
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===========================
   GET PROFILE
=========================== */

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    // Normalizar picture
    const profilePicture = getFullImageUrl(user.avatar);

    return res.json({ success: true, user: { ...user.toJSON(), profilePicture } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   UPDATE PROFILE
=========================== */

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'No autorizado' });

    const { name, surname, phone, profilePictureUrl, removePhoto } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    let newAvatar = user.avatar;

    // Si se sube un nuevo archivo
    if (req.file) {
      try {
        const publicId = `profile-${Date.now()}`;
        const uploadedId = await uploadImage(req.file.path, publicId);

        // Si la anterior era de Cloudinary (no URL), eliminarla
        if (user.avatar && !/^https?:\/\//i.test(user.avatar) && user.avatar !== getDefaultAvatarUrl()) {
          await deleteImage(user.avatar);
        }

        newAvatar = uploadedId;
      } catch (err) {
        console.warn('Error uploading new profile picture:', err.message || err);
      }
    } else if (profilePictureUrl) {
      if (!isValidUrl(profilePictureUrl)) {
        return res.status(400).json({ success: false, message: 'profilePictureUrl no es una URL válida' });
      }
      // Reemplazar por URL pública
      if (user.avatar && !/^https?:\/\//i.test(user.avatar) && user.avatar !== getDefaultAvatarUrl()) {
        await deleteImage(user.avatar);
      }
      newAvatar = profilePictureUrl;
    } else if (removePhoto === 'true' || removePhoto === '1' || removePhoto === true) {
      // Eliminar foto en Cloudinary si aplica y dejar null o default
      if (user.avatar && !/^https?:\/\//i.test(user.avatar) && user.avatar !== getDefaultAvatarUrl()) {
        await deleteImage(user.avatar);
      }
      newAvatar = getDefaultAvatarUrl();
    }

    await user.update({ name, surname, phone, avatar: newAvatar });

    return res.json({ success: true, message: 'Perfil actualizado correctamente', user: { ...user.toJSON(), profilePicture: getFullImageUrl(newAvatar) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
