import {Router} from 'express';
import {createCategory,getCategories,updateCategory,deleteCategory} from './categoryController.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

const router=Router();

/**
 * @swagger
 * /restaurantManagement/v1/category/create:
 *   post:
 *     summary: Crear una nueva categoría de platos
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Entradas
 *               description:
 *                 type: string
 *                 example: Entradas frías y calientes
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 */

/**
 * @swagger
 * /restaurantManagement/v1/category:
 *   get:
 *     summary: Listar todas las categorías
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Lista de categorías
 */

/**
 * @swagger
 * /restaurantManagement/v1/category/update/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Categoría actualizada
 */

router.post('/create', validateJWT,
    requireRole('ADMIN_ROLE'),createCategory);
router.get('/',getCategories);
router.put('/update/:id',validateJWT,
    requireRole('ADMIN_ROLE'),updateCategory);
router.delete('/delete/:id',validateJWT,
    requireRole('ADMIN_ROLE'),deleteCategory);

export default router;
