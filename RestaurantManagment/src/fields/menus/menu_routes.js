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

/**
 * @swagger
 * /restaurantManagement/v1/menu/create:
 *   post:
 *     summary: Crear un nuevo menú (diario, especial, etc.)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, restaurant, dishes]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Menú del Día
 *               description:
 *                 type: string
 *               restaurant:
 *                 type: string
 *               dishes:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *                 enum: [DAILY, NORMAL, SPECIAL]
 *                 example: DAILY
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Menú creado correctamente
 */

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