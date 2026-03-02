'use strict'

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';
import User from '../user/user.js';

/* ===========================
   EMAIL TEMPLATES
=========================== */

const emailBase = ({ title, preheader, bodyContent }) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', Arial, sans-serif;
      background-color: #0f0d0a;
      color: #e8e0d0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      background-color: #0f0d0a;
      padding: 48px 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #1a1710;
      border: 1px solid #3a3020;
      border-radius: 4px;
      overflow: hidden;
    }
    /* Header */
    .header {
      background: linear-gradient(135deg, #1a1710 0%, #2a2218 50%, #1a1710 100%);
      padding: 40px 48px 32px;
      border-bottom: 1px solid #3a3020;
      position: relative;
      text-align: center;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, #c9a84c, #e8c96e, #c9a84c, transparent);
    }
    .logo-icon {
      display: inline-block;
      width: 52px;
      height: 52px;
      margin-bottom: 16px;
    }
    .brand-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #c9a84c;
    }
    .brand-sub {
      font-size: 11px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #6a5e40;
      margin-top: 4px;
      font-weight: 300;
    }
    /* Divider */
    .gold-divider {
      text-align: center;
      padding: 0;
      margin: 0;
      line-height: 0;
    }
    .gold-divider span {
      display: inline-block;
      width: 48px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
      vertical-align: middle;
      margin: 0 8px;
    }
    .gold-divider::before, .gold-divider::after {
      content: '◆';
      font-size: 6px;
      color: #c9a84c;
    }
    /* Body */
    .body {
      padding: 40px 48px;
    }
    .greeting {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      font-weight: 500;
      color: #f0e8d8;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .message {
      font-size: 15px;
      color: #9a8e74;
      line-height: 1.8;
      font-weight: 300;
      margin-bottom: 32px;
    }
    .message strong {
      color: #c9a84c;
      font-weight: 500;
    }
    /* CTA Button */
    .btn-wrapper {
      text-align: center;
      margin: 36px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #c9a84c 0%, #e8c96e 50%, #c9a84c 100%);
      color: #0f0d0a !important;
      text-decoration: none;
      font-family: 'DM Sans', Arial, sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding: 16px 40px;
      border-radius: 2px;
    }
    /* Fallback link */
    .fallback {
      background-color: #141210;
      border: 1px solid #2a2218;
      border-radius: 2px;
      padding: 16px 20px;
      margin-top: 24px;
    }
    .fallback p {
      font-size: 12px;
      color: #6a5e40;
      margin-bottom: 8px;
      letter-spacing: 0.05em;
    }
    .fallback a {
      font-size: 12px;
      color: #9a8e74;
      word-break: break-all;
      line-height: 1.6;
    }
    /* Expiry notice */
    .notice {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background-color: #141210;
      border-left: 2px solid #c9a84c;
      padding: 14px 18px;
      border-radius: 0 2px 2px 0;
      margin-top: 28px;
    }
    .notice-icon {
      font-size: 14px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .notice p {
      font-size: 13px;
      color: #7a6e54;
      line-height: 1.6;
    }
    /* Footer */
    .footer {
      border-top: 1px solid #2a2218;
      padding: 28px 48px;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: #4a4030;
      line-height: 1.7;
      letter-spacing: 0.02em;
    }
    .footer a {
      color: #6a5e40;
      text-decoration: none;
    }
    .footer-ornament {
      margin-bottom: 16px;
      color: #3a3020;
      letter-spacing: 0.4em;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
  <div class="wrapper">
    <div class="container">

      <!-- HEADER -->
      <div class="header">
        <div>
          <!-- SVG Fork & Knife icon -->
          <svg class="logo-icon" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="25" stroke="#c9a84c" stroke-width="1" opacity="0.4"/>
            <circle cx="26" cy="26" r="21" stroke="#c9a84c" stroke-width="0.5" opacity="0.2"/>
            <!-- Fork -->
            <line x1="18" y1="14" x2="18" y2="24" stroke="#c9a84c" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="15" y1="14" x2="15" y2="20" stroke="#c9a84c" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="21" y1="14" x2="21" y2="20" stroke="#c9a84c" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M15 20 Q18 23 21 20" stroke="#c9a84c" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <line x1="18" y1="24" x2="18" y2="38" stroke="#c9a84c" stroke-width="1.5" stroke-linecap="round"/>
            <!-- Knife -->
            <path d="M34 14 Q37 20 37 26 L34 26 L34 38" stroke="#c9a84c" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="brand-name">Gestión Restaurante</div>
        <div class="brand-sub">Sistema de Administración</div>
      </div>

      <!-- BODY -->
      <div class="body">
        ${bodyContent}
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="footer-ornament">· · · · · · ·</div>
        <p>
          Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.<br/>
          Si no solicitaste esto, puedes ignorar este correo de forma segura.
        </p>
        <p style="margin-top:10px;">
          &copy; ${new Date().getFullYear()} Gestión Restaurante. Todos los derechos reservados.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`;

const verifyEmailTemplate = (verifyLink) => emailBase({
    title: 'Verifica tu cuenta',
    preheader: 'Un paso más para acceder a tu cuenta. Verifica tu correo electrónico.',
    bodyContent: `
      <h2 class="greeting">Bienvenido al equipo</h2>
      <p class="message">
        Gracias por registrarte en <strong>Gestión Restaurante</strong>. Tu cuenta ha sido creada exitosamente.<br/><br/>
        Para comenzar a utilizar el sistema, necesitas confirmar tu dirección de correo electrónico. Este paso garantiza la seguridad de tu cuenta.
      </p>

      <div class="btn-wrapper">
        <a href="${verifyLink}" class="btn">Verificar mi cuenta</a>
      </div>

      <div class="fallback">
        <p>¿El botón no funciona? Copia y pega este enlace en tu navegador:</p>
        <a href="${verifyLink}">${verifyLink}</a>
      </div>

      <div class="notice">
        <span class="notice-icon">◇</span>
        <p>Este enlace es de un solo uso y no tiene fecha de expiración. Si ya verificaste tu cuenta, puedes ignorar este mensaje.</p>
      </div>
    `
});

const resendVerificationTemplate = (verifyLink) => emailBase({
    title: 'Reenvío de verificación',
    preheader: 'Has solicitado un nuevo enlace de verificación para tu cuenta.',
    bodyContent: `
      <h2 class="greeting">Nuevo enlace<br/>de verificación</h2>
      <p class="message">
        Has solicitado un nuevo enlace para verificar tu cuenta en <strong>Gestión Restaurante</strong>.<br/><br/>
        Haz clic en el botón de abajo para confirmar tu dirección de correo y activar tu acceso al sistema.
      </p>

      <div class="btn-wrapper">
        <a href="${verifyLink}" class="btn">Verificar mi cuenta</a>
      </div>

      <div class="fallback">
        <p>¿El botón no funciona? Copia y pega este enlace en tu navegador:</p>
        <a href="${verifyLink}">${verifyLink}</a>
      </div>

      <div class="notice">
        <span class="notice-icon">◇</span>
        <p>Si no solicitaste este correo, alguien puede haber ingresado tu dirección por error. Puedes ignorarlo con seguridad.</p>
      </div>
    `
});

const resetPasswordTemplate = (resetLink) => emailBase({
    title: 'Recuperación de contraseña',
    preheader: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta.',
    bodyContent: `
      <h2 class="greeting">¿Olvidaste tu<br/>contraseña?</h2>
      <p class="message">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Gestión Restaurante</strong>.<br/><br/>
        Haz clic en el botón de abajo para crear una nueva contraseña. Si no realizaste esta solicitud, puedes ignorar este correo.
      </p>

      <div class="btn-wrapper">
        <a href="${resetLink}" class="btn">Restablecer contraseña</a>
      </div>

      <div class="fallback">
        <p>¿El botón no funciona? Copia y pega este enlace en tu navegador:</p>
        <a href="${resetLink}">${resetLink}</a>
      </div>

      <div class="notice">
        <span class="notice-icon">◇</span>
        <p>Este enlace expirará en <strong style="color:#c9a84c;">1 hora</strong> por razones de seguridad. Si necesitas uno nuevo, solicita otro restablecimiento desde la página de inicio de sesión.</p>
      </div>
    `
});


/* ===========================
   REGISTER
=========================== */

export const register = async (req, res) => {
    try {

        const { name, surname, username, email, password, phone } = req.body;

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

        await User.create({
            name,
            surname,
            username,
            email,
            phone,
            password: encryptedPassword,
            role,
            emailToken,
            emailVerified: false
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: { rejectUnauthorized: false }
        });

        const verifyLink =
            `http://localhost:${process.env.PORT}/restaurantManagement/v1/auth/verify-email?token=${emailToken}`;

        await transporter.sendMail({
            to: email,
            subject: 'Verifica tu cuenta — Gestión Restaurante',
            html: verifyEmailTemplate(verifyLink)
        });

        return res.status(201).json({
            success: true,
            message: 'Usuario creado. Revisa tu correo para verificar tu cuenta.'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


/* ===========================
   LOGIN
=========================== */

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

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

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: { rejectUnauthorized : false}
        });

        const verifyLink =
            `http://localhost:${process.env.PORT}/restaurantManagement/v1/auth/verify-email?token=${newEmailToken}`;

        await transporter.sendMail({
            to: user.email,
            subject: 'Nuevo enlace de verificación — Gestión Restaurante',
            html: resendVerificationTemplate(verifyLink)
        });

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

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetLink =
            `http://localhost:${process.env.PORT}/restaurantManagement/v1/auth/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            to: user.email,
            subject: 'Recuperación de contraseña — Gestión Restaurante',
            html: resetPasswordTemplate(resetLink)
        });

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