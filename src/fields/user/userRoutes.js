'use strict'

import { Router } from 'express';
import {
    createUser,
    getUsers,
    updateUser,
    deleteUser,
    confirmDeleteAdmin
} from './userController.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

router.post('/create', validateJWT, requireRole('ADMIN_ROLE'), createUser);
router.get('/', validateJWT, getUsers);
router.put('/:id', validateJWT, requireRole('ADMIN_ROLE'), updateUser);
router.delete('/:id', validateJWT, requireRole('ADMIN_ROLE'), deleteUser);
router.get('/confirm-delete', confirmDeleteAdmin);

export default router;