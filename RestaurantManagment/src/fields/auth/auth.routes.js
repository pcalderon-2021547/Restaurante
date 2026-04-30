'use strict'

import { Router } from 'express';
import {
  register,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  listUsers,resendVerification
} from './auth.controller.js';

import { validateRegister, validateLogin, validateResetPassword } from '../../../middlewares/authValidator.js';
import { rateLimitAuth } from '../../../middlewares/rateLimiter.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - surname
 *         - username
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: Pablo
 *         surname:
 *           type: string
 *           example: Andres
 *         username:
 *           type: string
 *           example: PabloAndres
 *         email:
 *           type: string
 *           format: email
 *           example: pdeleon-2021364@kinal.edu.gt
 *         password:
 *           type: string
 *           example: 1234pablo
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     VerifyEmailInput:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *     RequestResetInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *     ResetPasswordInput:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *         newPassword:
 *           type: string
 *     ResendVerificationInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 */

/**
 * @swagger
 * /restaurantManagement/v1/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos o email ya registrado
 */

/**
 * @swagger
 * /restaurantManagement/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales incorrectas o email no verificado
 */

/**
 * @swagger
 * /restaurantManagement/v1/auth/verify-email:
 *   post:
 *     summary: Verificar correo electrónico
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailInput'
 *     responses:
 *       200:
 *         description: Email verificado correctamente
 *       400:
 *         description: Token inválido o expirado
 */

/**
 * @swagger
 * /restaurantManagement/v1/auth/resend-verification:
 *   post:
 *     summary: Reenviar correo de verificación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendVerificationInput'
 *     responses:
 *       200:
 *         description: Correo reenviado
 *       400:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /restaurantManagement/v1/auth/request-reset:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestResetInput'
 *     responses:
 *       200:
 *         description: Correo enviado
 */

/**
 * @swagger
 * /restaurantManagement/v1/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Contraseña restablecida correctamente
 *       400:
 *         description: Token inválido o expirado
 */

router.post('/register', rateLimitAuth, validateRegister,register);
router.post('/login', rateLimitAuth, validateLogin,login);

router.post('/verify-email', verifyEmail);
router.get('/verify-email', verifyEmail);

router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', validateResetPassword,resetPassword);

router.get('/users', validateJWT, requireRole('ADMIN_ROLE'), listUsers);

router.get('/reset-password', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }

    return res.send(`
        <h1>Token recibido:</h1>
        <p>${token}</p>
    `);
});
router.post('/resend-verification', resendVerification);

export default router;