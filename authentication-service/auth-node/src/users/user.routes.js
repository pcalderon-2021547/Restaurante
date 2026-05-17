import { Router } from 'express';
import {
  updateUserRole,
  updateUserProfile,
  getUserRoles,
  getUsersByRole,
} from './user.controller.js';

const router = Router();

// PUT /api/v1/users/:userId          — editar datos + imagen
router.put('/:userId', ...updateUserProfile);

// PUT /api/v1/users/:userId/role     — cambiar rol
router.put('/:userId/role', ...updateUserRole);

// GET /api/v1/users/:userId/roles
router.get('/:userId/roles', ...getUserRoles);

// GET /api/v1/users/by-role/:roleName
router.get('/by-role/:roleName', ...getUsersByRole);

export default router;
