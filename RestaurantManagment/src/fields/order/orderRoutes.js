import { Router } from 'express';
import {
    createOrder,
    getOrders,
    updateOrder,
    deleteOrder,
    sendAllOrdersPDF,
    sendOrdersByRestaurantPDF,
    sendOrdersByStatusPDF,
    sendOrderByIdPDF
} from './orderController.js';

import { validateJWT } from '../../../middlewares/validate_jwt.js';
import { requireRole } from '../../../middlewares/validate_role.js';

import {
    validateOrderId,
    validateCreateOrder,
    validateOrderStatus
} from '../../../middlewares/orderValidator.js';

const router = Router();

/**
 * @swagger
 * /restaurantManagement/v1/order/create:
 *   post:
 *     summary: Crear una nueva orden
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user, restaurant, type, status, subtotal, tax, total]
 *             properties:
 *               user:
 *                 type: string
 *                 example: 65f123abc4567890abcd1111
 *               restaurant:
 *                 type: string
 *                 example: 65f123abc4567890abcd2222
 *               type:
 *                 type: string
 *                 enum: [delivery, dine-in, takeaway]
 *                 example: delivery
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, ready, delivered, cancelled]
 *                 example: pending
 *               address:
 *                 type: string
 *                 example: Zona 10, Ciudad de Guatemala
 *               table:
 *                 type: string
 *                 description: ID de mesa (solo para dine-in)
 *               subtotal:
 *                 type: number
 *                 example: 200
 *               tax:
 *                 type: number
 *                 example: 24
 *               total:
 *                 type: number
 *                 example: 224
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 */

/**
 * @swagger
 * /restaurantManagement/v1/order:
 *   get:
 *     summary: Listar todas las órdenes
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes
 */

/**
 * @swagger
 * /restaurantManagement/v1/order/update/{id}:
 *   put:
 *     summary: Actualizar una orden
 *     tags: [Order]
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
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, ready, delivered, cancelled]
 *               table:
 *                 type: string
 *               total:
 *                 type: number
 *     responses:
 *       200:
 *         description: Orden actualizada
 */

/* ===============================
   Crear Orden
=================================*/
router.post(
    '/create',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateCreateOrder,
    createOrder
);


router.get('/', getOrders);


router.put(
    '/update/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateOrderId,
    validateOrderStatus,
    updateOrder
);

router.delete(
    '/delete/:id',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    validateOrderId,
    deleteOrder
);

// ── REPORTES PDF (solo ADMIN) ─────────────────────────────────────────────────
/**
 * GET /order/send-pdf/all/:email
 * Envía PDF con TODAS las órdenes
 */
router.get('/send-pdf/all/:email', validateJWT, requireRole('ADMIN_ROLE'), sendAllOrdersPDF);

/**
 * GET /order/send-pdf/restaurant/:restaurantId/:email
 * Envía PDF con las órdenes de UN restaurante específico
 */
router.get('/send-pdf/restaurant/:restaurantId/:email', validateJWT, requireRole('ADMIN_ROLE'), sendOrdersByRestaurantPDF);

/**
 * GET /order/send-pdf/status/:status/:email
 * Envía PDF filtrando por estado: pending | preparing | ready | delivered | paid | cancelled
 */
router.get('/send-pdf/status/:status/:email', validateJWT, requireRole('ADMIN_ROLE'), sendOrdersByStatusPDF);

/**
 * GET /order/send-pdf/:id/:email
 * Envía PDF con el detalle de UNA orden específica
 */
router.get('/send-pdf/:id/:email', validateJWT, requireRole('ADMIN_ROLE'), sendOrderByIdPDF);

export default router;
