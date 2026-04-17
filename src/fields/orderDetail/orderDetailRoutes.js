import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /restaurantManagement/v1/orderDetail/create:
 *   post:
 *     summary: Agregar detalle a una orden (platillo + cantidad)
 *     tags: [OrderDetail]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order, dish, quantity]
 *             properties:
 *               order:
 *                 type: string
 *                 example: 69a4cdc03e5d7fb948409722
 *               dish:
 *                 type: string
 *                 example: 69a4e23946f0f83c4babeb07
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               price:
 *                 type: number
 *               subtotal:
 *                 type: number
 *     responses:
 *       201:
 *         description: Detalle de orden agregado
 */

/**
 * @swagger
 * /restaurantManagement/v1/orderDetail:
 *   get:
 *     summary: Listar todos los detalles de órdenes
 *     tags: [OrderDetail]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de detalles
 */ 

import {
    createOrderDetail,
    getOrderDetails,
    updateOrderDetail,
    deleteOrderDetail
} from './orderDetailController.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

router.post(
    '/create',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    createOrderDetail
);

router.get('/', getOrderDetails);

router.put(
    '/update/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    updateOrderDetail
);

router.delete(
    '/delete/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    deleteOrderDetail
);

export default router;