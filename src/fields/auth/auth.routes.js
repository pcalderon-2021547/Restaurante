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