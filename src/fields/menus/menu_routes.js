import { Router } from 'express';
import {
    createMenu,
    getMenus,
    updateMenu,
    deleteMenu
} from './menu_controller.js';
import { validateCreateMenu, validateMenuId } from '../../../middlewares/menuValidator.js';
import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router = Router();

router.post(
    '/create',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateCreateMenu,
    createMenu
);

router.get('/', getMenus);

router.put(
    '/update/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateMenuId,
    updateMenu
);

router.delete(
    '/delete/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateMenuId,
    deleteMenu
);

export default router;