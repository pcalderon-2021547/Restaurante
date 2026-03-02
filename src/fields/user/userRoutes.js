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

router.post('/create',  createUser);
router.get('/', validateJWT, getUsers);
router.put('/:id', validateJWT,  updateUser);
router.delete('/:id', validateJWT, deleteUser);
router.get('/confirm-delete', validateJWT, confirmDeleteAdmin);

export default router;