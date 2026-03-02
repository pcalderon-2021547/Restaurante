'use strict';
import { Router } from 'express';
import { 
    createMenu, 
    getMenus, 
    updateMenu, 
    deleteMenu 
} from './menu_controller.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

router.post(
    '/create',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    createMenu
);

router.get('/', getMenus);

router.put(
    '/update/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    updateMenu
);

router.delete(
    '/delete/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    deleteMenu
);

export default router;